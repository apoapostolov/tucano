import { parse } from '@babel/parser';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

// Settings sections are declared in settings-structure.ts (id, page, keys, label) and the strip
// under the tabs is built from `tabSections`, which names the sections each tab shows. The page
// renders those cards through `pane('…')` conditions; a card carries its section as
// `<Card section="…">` or inside a `<SectionAnchor id="…">`. There is no content map any more, so
// this walks the rendered pane tree instead: every section a tab lists must be rendered in that
// tab's pane, every rendered anchor must be listed for the pane that renders it, and no section
// may be rendered twice. Cards that are deliberately outside the strip stay listed below with the
// reason they have no anchor, so a new unowned card fails the check instead of drifting silently.

// Cards the page renders without a section anchor, by their English title. Each one is work that
// belongs to no tab yet (see the comments beside them in Pages.tsx). A card that gains an anchor
// leaves this list; a new unanchored card fails.
// Every card on Settings now carries a section of its own, so this list is empty: the check below
// fails the moment a new card is drawn without one, and fails again if an entry here outlives its card.
export const UNOWNED_CARDS = [];

// Settings keys written by a card that no section declares yet. The feedback card's survey toggle
// is the only one: it lives in app chrome that settings-structure.ts does not describe. A key that
// gains a section leaves this list; a new undeclared key fails.
export const UNSECTIONED_KEYS = [
  { key: 'surveys', reason: 'the feedback card has no section in settings-structure.ts yet' }
];

const SKIP = new Set(['loc', 'extra', 'comments', 'leadingComments', 'trailingComments', 'innerComments', 'typeAnnotation', 'returnType', 'typeParameters']);
const children = node => Object.entries(node)
  .filter(([key]) => !SKIP.has(key))
  .flatMap(([, value]) => (Array.isArray(value)
    ? value.filter(n => n && typeof n.type === 'string')
    : value && typeof value.type === 'string' ? [value] : []));
const find = (node, predicate) => (predicate(node) ? node : children(node).map(n => find(n, predicate)).find(Boolean));
const property = (node, name) => node?.properties?.find(p => p.type === 'ObjectProperty' && (p.key.name || p.key.value) === name)?.value;
const literal = node => {
  if (!node) return undefined;
  if (node.type === 'StringLiteral') return node.value;
  if (node.type === 'JSXExpressionContainer') return literal(node.expression);
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0]?.value.cooked;
  return undefined;
};
// The English half of `L('Português', 'English')`, or the literal title: what a person reads in an
// English window, and what the unowned-card list names.
const title = node => {
  if (!node) return undefined;
  if (node.type === 'StringLiteral') return node.value;
  if (node.type === 'JSXExpressionContainer') return title(node.expression);
  if (node.type === 'CallExpression') {
    const args = node.arguments.filter(a => a.type === 'StringLiteral');
    return args.length > 1 ? args[1].value : args[0]?.value;
  }
  return undefined;
};

/**
 * Checks the Settings page against its declared structure: pane placement, one owner per section,
 * and literal settings writes inside the card that owns them.
 * @param {string} workspace repository root
 * @param {{ files?: Record<string, string> }} [options] file overrides, keyed by repository-relative
 *   path. Tests use it to prove the check fails on a deliberate violation without writing to the tree.
 */
export function inspectSettingsPlacement(workspace, options = {}) {
  const root = resolve(workspace);
  const overrides = new Map(Object.entries(options.files ?? {}).map(([path, source]) => [resolve(root, path), source]));
  const files = new Map();
  const read = file => {
    if (files.has(file)) return files.get(file);
    if (!existsSync(file) && !overrides.has(file)) throw new Error('Missing file: ' + relative(root, file));
    const source = overrides.has(file) ? overrides.get(file) : readFileSync(file, 'utf8');
    const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
    const functions = new Map();
    for (const statement of ast.program.body.map(n => n.declaration || n)) {
      if (statement.type === 'FunctionDeclaration' && statement.id) functions.set(statement.id.name, statement);
      if (statement.type === 'VariableDeclaration') {
        for (const variable of statement.declarations) {
          if (variable.id.type === 'Identifier' && ['ArrowFunctionExpression', 'FunctionExpression'].includes(variable.init?.type)) functions.set(variable.id.name, variable.init);
        }
      }
    }
    const imports = new Map();
    for (const declaration of ast.program.body.filter(n => n.type === 'ImportDeclaration' && n.source.value.startsWith('.'))) {
      const path = resolve(dirname(file), declaration.source.value);
      const target = [path + '.tsx', path + '.ts', join(path, 'index.tsx'), join(path, 'index.ts')]
        .find(candidate => existsSync(candidate) || overrides.has(candidate));
      if (!target) continue;
      if (!target.startsWith(join(root, 'src') + sep)) throw new Error('Review settings imports outside src: ' + target);
      for (const specifier of declaration.specifiers.filter(n => n.type === 'ImportSpecifier' && n.importKind !== 'type')) imports.set(specifier.local.name, { file: target, name: specifier.imported.name });
    }
    const result = { source, ast, functions, imports };
    files.set(file, result);
    return result;
  };

  const failures = [];
  const structureFile = join(root, 'src/renderer/src/settings-structure.ts');
  const structure = read(structureFile);
  if (!structure.functions.has('settingsStructure')) throw new Error('Missing settingsStructure.');
  const declared = find(structure.ast, n => n.type === 'ArrayExpression' && n.elements.length > 0 && n.elements.every(el => el?.type === 'ObjectExpression' && property(el, 'id')));
  if (!declared) throw new Error('settings-structure.ts must declare its sections as an array of objects with an id.');
  const sections = declared.elements.map(node => ({
    id: literal(property(node, 'id')),
    keys: (property(node, 'keys')?.elements ?? []).map(literal),
    line: node.loc.start.line
  }));
  const tabEntries = find(structure.ast, n => n.type === 'VariableDeclarator' && n.id.name === 'tabSections')?.init;
  if (tabEntries?.type !== 'ObjectExpression') throw new Error('settings-structure.ts must declare tabSections, the sections each tab shows.');
  const tabs = new Map(tabEntries.properties.filter(p => p.type === 'ObjectProperty').map(p => [p.key.value ?? p.key.name, (p.value.elements ?? []).map(literal)]));
  if (!structure.functions.has('settingsTabStructure')) throw new Error('settings-structure.ts must export settingsTabStructure, which reads the strip from tabSections.');

  // Declared sections own their keys, once each.
  const keyOwner = new Map();
  const declaredIds = new Map();
  for (const section of sections) {
    if (!section.id) failures.push(`Section without an id at settings-structure.ts:${section.line}`);
    if (declaredIds.has(section.id)) failures.push(`Duplicate section: ${section.id} (settings-structure.ts:${declaredIds.get(section.id)} and :${section.line})`);
    declaredIds.set(section.id, section.line);
    for (const key of section.keys) {
      if (keyOwner.has(key)) failures.push(`${key} is owned by both ${keyOwner.get(key).id} and ${section.id}`);
      keyOwner.set(key, section);
    }
  }
  for (const [tab, ids] of tabs) {
    for (const id of ids) if (!declaredIds.has(id)) failures.push(`Tab ${tab} lists ${id}, which settings-structure.ts does not declare`);
  }

  const pagesFile = join(root, 'src/renderer/src/components/Pages.tsx');
  const pages = read(pagesFile);
  const page = pages.functions.get('SettingsPage');
  if (!page) throw new Error('Pages.tsx must export SettingsPage.');
  const tabList = pages.functions.get('SETTINGS_TABS');
  const declaredTabs = new Set();
  const collectTabs = node => {
    if (!node) return;
    if (node.type === 'StringLiteral') declaredTabs.add(node.value);
    children(node).forEach(collectTabs);
  };
  collectTabs(tabList?.body);
  // The groups at the top of Settings are built from settings-structure.ts (`settingsGroups(...)`), so a
  // tab listed there is a tab this page draws by construction; a hand-written list must still name them.
  const derivedTabs = find(tabList?.body, n => n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'settingsGroups');
  if (!derivedTabs) {
    for (const tab of tabs.keys()) {
      if (!declaredTabs.has(tab)) failures.push(`settings-structure.ts lists sections for tab ${tab}, which the Settings page does not declare in SETTINGS_TABS`);
    }
  }
  // The helper that says which group a card belongs to: `pane(group)` or, since the five groups became
  // sections with a jump row, `on(group)`. Either way it is a local arrow comparing the open tab.
  // `on` reads `!searching && tab === group`, so the comparison may sit inside a larger expression:
  // what matters is that the helper decides by the open tab.
  const comparesTab = (body, name) => {
    const hit = node => {
      if (!node) return false;
      if (node.type === 'BinaryExpression' && node.operator === '===' &&
        ((node.left?.name === 'tab' && node.right?.name === name) || (node.right?.name === 'tab' && node.left?.name === name))) return true;
      return children(node).some(hit);
    };
    return hit(body);
  };
  const helper = ['pane', 'on']
    .map(name => find(page, n => n.type === 'VariableDeclarator' && n.id.name === name))
    .find(node => {
      const init = node?.init;
      const argument = init?.params?.[0];
      return init?.type === 'ArrowFunctionExpression' && argument?.type === 'Identifier' && comparesTab(init.body, argument.name);
    });
  if (!helper) throw new Error('SettingsPage must render from pane(tab) or on(tab): the local helper comparing the open tab.');
  const paneName = helper.id.name;

  const paneNames = node => {
    const names = [];
    const walk = current => {
      if (!current) return;
      if (current.type === 'CallExpression' && current.callee.type === 'Identifier' && current.callee.name === paneName) {
        const name = literal(current.arguments[0]);
        if (name) names.push(name);
        return;
      }
      children(current).forEach(walk);
    };
    walk(node);
    return [...new Set(names)];
  };

  const rendered = new Map();
  const unowned = [];
  const writes = [];
  const drawn = [];
  const unsectioned = new Set();
  const deferred = [];
  const visited = new Set();
  const claim = (id, site) => {
    if (!id) return;
    const entry = { id, pane: site.panes.join('+'), file: relative(root, site.file).split(sep).join('/'), line: site.line };
    rendered.set(id, [...(rendered.get(id) ?? []), entry]);
    site.scope?.sections.add(id);
  };

  const visit = (node, context) => {
    if (!node) return;
    switch (node.type) {
      case 'JSXElement':
      case 'JSXSelfClosingElement': {
        const opening = node.openingElement || node;
        const name = opening.name.type === 'JSXIdentifier' ? opening.name.name : undefined;
        const attribute = attributeName => opening.attributes.find(attr => attr.type === 'JSXAttribute' && attr.name?.name === attributeName);
        const next = { ...context };
        const file = relative(root, context.file).split(sep).join('/');
        if (name === 'SectionAnchor') {
          const id = literal(attribute('id')?.value);
          claim(id, { ...context, line: opening.loc.start.line });
          next.section = id ?? context.section;
          next.unanchored = false;
        } else if (name === 'Card') {
          const section = literal(attribute('section')?.value);
          if (section) {
            // The five groups anchor a card with `SectionAnchor id` and the card names the same
            // section again: one card, one claim. A second claim is only a real duplicate elsewhere.
            if (section !== context.section) claim(section, { ...context, line: opening.loc.start.line });
            next.section = section;
            next.unanchored = false;
          } else if (!context.section && context.panes.some(paneName => tabs.has(paneName))) {
            // A tab with no sections in settings-structure.ts (Routing, today) has no strip, so its
            // cards are outside this contract; the tabs that do have a strip must own every card.
            unowned.push({ card: title(attribute('title')?.value) ?? 'untitled card', file, line: opening.loc.start.line, pane: context.panes.join('+') });
            next.unanchored = true;
          }
        } else if (name && /^[A-Z]/.test(name)) {
          const resource = read(context.file);
          const target = resource.functions.has(name) ? { file: context.file, name } : resource.imports.get(name);
          if (target) {
            const aliases = new Set(context.aliases);
            for (const attr of opening.attributes) {
              if (attr.type !== 'JSXAttribute' || !attr.name?.name) continue;
              const value = attr.value?.type === 'JSXExpressionContainer' ? attr.value.expression : undefined;
              if (value?.type === 'Identifier' && context.aliases.has(value.name)) aliases.add(attr.name.name);
            }
            scanComponent(target.file, target.name, { ...context, aliases, line: opening.loc.start.line });
          }
        }
        if (node.children?.length) visitChildren(node.children, next);
        // Inline handlers (`onChange={(v) => updateSettings({ … })}`) live in attributes, not
        // children, and still write from inside the card that holds them.
        for (const attr of opening.attributes) {
          if (attr.type === 'JSXAttribute' && attr.value?.type === 'JSXExpressionContainer') visit(attr.value.expression, next);
        }
        return;
      }
      case 'JSXFragment':
        return visitChildren(node.children ?? [], context);
      case 'JSXExpressionContainer':
        return visit(node.expression, context);
      case 'LogicalExpression':
        if (node.operator === '&&') {
          const panes = paneNames(node.left);
          return visit(node.right, panes.length ? { ...context, panes } : context);
        }
        visit(node.left, context);
        return visit(node.right, context);
      case 'ConditionalExpression':
        visit(node.consequent, context);
        return visit(node.alternate, context);
      case 'CallExpression': {
        const callee = node.callee;
        if (callee.type === 'Identifier' && context.aliases.has(callee.name) && node.arguments[0]?.type === 'ObjectExpression') {
          const file = relative(root, context.file).split(sep).join('/');
          for (const item of node.arguments[0].properties) {
            // A spread carries keys this pass cannot see; the computed-key case below still asks for
            // a person's review, and the spread itself is reviewed with the card it writes from.
            if (item.type !== 'ObjectProperty') continue;
            const key = item.computed ? undefined : item.key.name || item.key.value;
            if (!key) {
              failures.push(`Computed settings write needs explicit review at ${file}:${node.loc.start.line}`);
              continue;
            }
            const write = { key, section: context.section, unanchored: !!context.unanchored, component: context.scope?.name, file, line: node.loc.start.line };
            writes.push(write);
            const owner = keyOwner.get(key);
            if (!owner) {
              const known = UNSECTIONED_KEYS.find(entry => entry.key === key);
              unsectioned.add(key);
              if (!known) failures.push(`${key} is written in ${context.section ?? 'an unanchored card'}, but settings-structure.ts declares no section for it (${file}:${node.loc.start.line})`);
            } else if (context.section) {
              // A card may draw a key another section owns (the routing switch lives in the router
              // card, the browser job in the classifier uses card), but the key still has one owner.
              if (owner.id !== context.section) drawn.push({ ...write, card: context.section, owner: owner.id });
            } else if (context.scope) deferred.push({ write, scope: context.scope });
          }
        }
        return children(node).forEach(child => visit(child, context));
      }
      case 'BlockStatement':
      case 'Program':
        return node.body.forEach(child => visit(child, context));
      default:
        return children(node).forEach(child => visit(child, context));
    }
  };
  const visitChildren = (list, context) => list.forEach(child => visit(child, context));
  const scanComponent = (file, name, context) => {
    const definition = read(file).functions.get(name);
    if (!definition) return;
    const signature = `${file}:${name}:${context.section}:${context.panes.join('+')}:${[...context.aliases].join(',')}`;
    if (visited.has(signature)) return;
    visited.add(signature);
    const scope = { name, sections: new Set(context.section ? [context.section] : []) };
    visit(definition.body, { ...context, file, scope });
  };

  const returned = page.body.type === 'BlockStatement' ? page.body.body.filter(n => n.type === 'ReturnStatement').pop() : undefined;
  const tree = returned?.argument ?? page.body;
  const pageScope = { name: 'SettingsPage', sections: new Set() };
  visit(tree, { file: pagesFile, section: null, panes: [], aliases: new Set(['updateSettings']), line: tree.loc.start.line, scope: pageScope });

  // A handler written above the markup has no card around it, so its section is the component it
  // lives in. The write is owned when that component renders the section that declares the key.
  let scopedWrites = 0;
  for (const { write, scope } of deferred) {
    const owner = keyOwner.get(write.key);
    if (!owner) continue;
    if (scope.sections.size === 0) continue;
    scopedWrites += 1;
    if (scope.sections.has(owner.id)) write.section = owner.id;
    else if (!write.unanchored) drawn.push({ key: write.key, card: [...scope.sections].join('+'), component: scope.name, owner: owner.id, file: write.file, line: write.line });
  }
  for (const entry of UNSECTIONED_KEYS) {
    if (!unsectioned.has(entry.key)) failures.push(`UNSECTIONED_KEYS still lists ${entry.key}, which no card writes (${entry.reason})`);
  }

  // Each tab's sections must be rendered in that tab's pane, once, and nothing else may claim them.
  const expectedPane = new Map();
  for (const [tab, ids] of tabs) for (const id of ids) expectedPane.set(id, tab);
  for (const [id, sites] of rendered) {
    if (!declaredIds.has(id)) {
      for (const site of sites) failures.push(`Undeclared section rendered: ${id} (${site.file}:${site.line})`);
      continue;
    }
    if (sites.length > 1) failures.push(`Section is rendered ${sites.length} times: ${id} (${sites.map(s => `${s.pane || 'no pane'} at ${s.file}:${s.line}`).join(', ')})`);
    for (const site of sites) {
      if (!site.pane) failures.push(`Section is rendered outside any pane: ${id} (${site.file}:${site.line})`);
      else if (!expectedPane.has(id)) failures.push(`Section ${id} is rendered in pane ${site.pane}, but no tab in settings-structure.ts lists it (${site.file}:${site.line})`);
      else if (!site.pane.split('+').includes(expectedPane.get(id))) failures.push(`Section ${id} belongs to tab ${expectedPane.get(id)} but is rendered in pane ${site.pane} (${site.file}:${site.line})`);
    }
  }
  for (const [id, tab] of expectedPane) {
    if (!rendered.has(id)) failures.push(`Section ${id} is listed for tab ${tab}, but no card renders its anchor`);
  }
  for (const card of unowned) {
    if (!UNOWNED_CARDS.some(known => known.card === card.card)) failures.push(`Settings card is not owned by a section: ${card.card} (${card.file}:${card.line})`);
  }
  for (const entry of UNOWNED_CARDS) {
    if (!unowned.some(card => card.card === entry.card)) failures.push(`UNOWNED_CARDS still lists ${entry.card}, which no card renders without a section any more (${entry.reason})`);
  }

  return {
    sections: sections.length,
    keys: keyOwner.size,
    tabs: tabs.size,
    renderedSections: rendered.size,
    unownedCards: [...new Set(unowned.map(card => card.card))],
    checkedWrites: writes.length,
    scopedWrites,
    unplacedWrites: writes.filter(write => !write.section).length,
    drawnOutsideOwner: drawn.map(({ key: written, card, component, owner, file, line }) => ({ key: written, card, component, owner, file, line })),
    panes: [...new Set([...rendered.values()].flat().map(site => site.pane))].sort(),
    writes: writes.map(({ unanchored, ...write }) => write),
    failures: [...new Set(failures)],
    passed: failures.length === 0
  };
}
