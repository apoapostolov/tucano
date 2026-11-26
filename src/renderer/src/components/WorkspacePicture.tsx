// The picture a workspace wears in Manage workspaces. It is kept in that workspace's own database
// through the desktop API, so a backup carries it and another workspace never shares it. Bitmaps take
// the connector picture's path: picked or pasted here, shrunk in the window before it is sent.
import { useRef, useState, type ReactNode } from 'react'
import { L } from '../../../shared/lang'
import type { WorkspaceSummary } from '../../../shared/workspaces'
import { toast } from '../store'
import { iconFromFile, iconFromAddress, imageFromClipboard } from '../connector-icon'
import { Modal } from './Modal'
import { Icon } from './ui'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'

export function WorkspacePictureButton({ workspace, onOpen, disabled = false }: { workspace: WorkspaceSummary; onOpen: () => void; disabled?: boolean }): ReactNode {
  const title = L(`Alterar a imagem de ${workspace.name}`, `Change ${workspace.name}'s picture`)
  return (
    <button type="button" className="workspace-picture__thumb" title={title} aria-label={title} disabled={disabled} onClick={onOpen}>
      <span className="workspace-picture__face">
        {workspace.picture ? <img src={workspace.picture} alt="" /> : <Icon name="layers" size={20} />}
        <span className="workspace-picture__ring" aria-hidden />
        <span className="workspace-picture__edit" aria-hidden><Icon name="edit" size={12} /></span>
      </span>
    </button>
  )
}

export function WorkspacePicture({ workspace, value, onClose }: { workspace: WorkspaceSummary; value: string; onClose: () => void }): ReactNode {
  const [picture, setPicture] = useState(value)
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const api = window.tucano.workspaces

  const save = async (next: Promise<string> | string): Promise<void> => {
    if (!api?.setPicture) return toast(L('Este app não pode mudar a imagem do workspace.', 'This app cannot change a workspace picture.'))
    setBusy(true)
    try {
      const chosen = await next
      await api.setPicture(workspace.id, chosen)
      setPicture(chosen)
      setAddress('')
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : L('Não consegui usar essa imagem.', "I couldn't use that image."))
    } finally {
      setBusy(false)
    }
  }
  const fromFile = (picked: File | undefined): void => {
    if (picked) void save(iconFromFile(picked))
  }
  const paste = (from: File | null): void => {
    if (!from) return toast(L('Não há imagem na área de transferência.', 'There is no image on the clipboard.'))
    void save(iconFromFile(from))
  }
  // The address check throws before it returns a value, so it goes through a promise to reach save's
  // catch and show the same toast a rejected file shows.
  const fromAddress = (): void => { void save(Promise.resolve().then(() => iconFromAddress(address))) }

  return (
    <div
      className="workspace-picture__wrap"
      onPaste={(event) => {
        const item = [...(event.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'))
        const from = item?.getAsFile()
        if (from) {
          event.preventDefault()
          paste(from)
        }
      }}
    >
      <Modal key="picture" title={L('Imagem do workspace', 'Workspace picture')} onClose={onClose} className="workspace-picture">
        <div className="workspace-picture__body">
          <p className="muted small modal__lead">{L('A imagem aparece ao lado do nome deste workspace, só aqui.', 'The picture shows beside this workspace’s name, here only.')}</p>
          <div className={`workspace-picture__placeholder ${picture ? 'has-picture' : ''}`}>
            {picture ? <img src={picture} alt={L(`Imagem de ${workspace.name}`, `${workspace.name}'s picture`)} /> : <><Icon name="image" size={28} /><span>{L('Sem imagem', 'No picture')}</span></>}
          </div>
          <div className="workspace-picture__actions">
            <input
              ref={file}
              type="file"
              accept={ACCEPT}
              hidden
              onChange={(event) => {
                const picked = event.target.files?.[0]
                event.target.value = '' // the same file again still counts as a choice
                fromFile(picked)
              }}
            />
            <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={() => file.current?.click()}>{L('Escolher imagem', 'Choose image')}</button>
            <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={() => void imageFromClipboard().then(paste)}>{L('Colar imagem', 'Paste image')}</button>
            {picture && <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={() => void save('')}>{L('Usar o padrão', 'Use the default')}</button>}
          </div>
          <label className="field">
            <span className="field__label">{L('Endereço da imagem', 'Image address')}</span>
            <div className="row workspace-picture__url">
              <input type="url" value={address} placeholder="https://" aria-label={L('Endereço da imagem', 'Image address')} onChange={(event) => setAddress(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !busy && address.trim()) { event.preventDefault(); fromAddress() } }} />
              <button type="button" className="btn btn--ghost btn--sm" disabled={busy || !address.trim()} onClick={fromAddress}>{L('Adicionar', 'Add')}</button>
            </div>
          </label>
          <p className="small muted">{L('PNG, JPEG, WebP, GIF ou SVG, escolhidos ou colados. Um endereço precisa começar em https://.', 'PNG, JPEG, WebP, GIF or SVG, picked or pasted. An address must start with https://.')}</p>
        </div>
        <footer className="modal__foot">
          <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={onClose}>{L('Fechar', 'Close')}</button>
        </footer>
      </Modal>
    </div>
  )
}
