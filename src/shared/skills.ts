import { L, locale } from './lang'

export const RECOMMENDED_SKILL_BODY_LENGTH = 10_000
// Past the recommendation a recipe is kept whole; this is only the ceiling for one that isn't a
// recipe at all (a file pasted by mistake, an agent writing on and on), far above any real one.
export const MAX_SKILL_BODY_LENGTH = 1_000_000
export const tooLongSkill = (): string =>
  L(`A receita passou de ${MAX_SKILL_BODY_LENGTH.toLocaleString(locale())} caracteres.`, `The recipe is over ${MAX_SKILL_BODY_LENGTH.toLocaleString(locale())} characters.`)

export function skillLengthNote(length: number): string {
  const excess = length - RECOMMENDED_SKILL_BODY_LENGTH
  return excess > 0
    ? L(
        `Receita longa: ${length.toLocaleString(locale())} caracteres, ${excess.toLocaleString(locale())} acima do recomendado de ${RECOMMENDED_SKILL_BODY_LENGTH.toLocaleString(locale())}. Recomendamos encurtar; a receita inteira será mantida.`,
        `Long instructions: ${length.toLocaleString(locale())} characters (${excess.toLocaleString(locale())} above the recommended ${RECOMMENDED_SKILL_BODY_LENGTH.toLocaleString(locale())}). Full text is retained.`
      )
    : ''
}

export const overlongSkillNote = (name: string, length: number): string => {
  const note = skillLengthNote(length)
  return note ? `${name} · ${note}` : ''
}
