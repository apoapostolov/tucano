# Conversas, canais e threads
> Canais, mensagens diretas, threads, menções, quem responde, passagem de vez entre agentes, parar e tentar de novo, imagens e ditado.

## Canais e DMs
- **Canal**: o **+** ao lado de **Canais**, ⌘N (Ctrl+N) ou **Novo canal** no ⌘K. Nome em minúsculas e hífens ("Squad Pagamentos" vira squad-pagamentos), depois os agentes.
- **DM**: a conversa com um agente só, que sempre responde ali. No menu dele, **Mandar mensagem**.
- No menu do canal (botão direito): **Adicionar ou remover agentes…**, **Configurações do canal…** (nome, **Tema**, onde respondem), **Marcar como lido**, mover e agrupar, **Excluir canal…**.

## Quem responde num canal
- Com @handle, responde quem foi chamado.
- Sem menção, o **Roteador** lê a conversa e escolhe quem responde, pelo papel e pelos conectores de cada um.
- **Modo menção**: em **Agentes em #canal** (o **+** da pilha), marque o agente e o **Modo menção**: ele lê tudo e só responde quando é chamado com @, como um modelo caro num canal. Com todos em modo menção, a mensagem fica sem resposta e o app avisa.
- **Modo escuta**: no mesmo lugar. Antes de escolher quem responde, o **Jev** lê a mensagem e diz se ela pede o que só esse agente faz: só então ele entra. Sem a chave do TypeSafe, fica de fora.
- Vários chamados respondem um depois do outro, na ordem: cada um lê o que os anteriores fizeram e faz a sua parte.
- Um agente que menciona outro na resposta: o roteador só chama quem tem o que fazer (um "obrigado" não acorda ninguém), e quem já responde ali vê na próxima.
- Depois de 3 respostas seguidas entre agentes a partir da sua mensagem, a conversa para; mande outra pra continuar.
- **/objetivo** antes do pedido (ex.: "/objetivo @dev landing revisada"): os agentes trabalham sozinhos, passando a vez, até um marcar como cumprido. Param em 12 respostas, numa repetida ou se ninguém passar a vez, com aviso.

## Threads
Em **Configurações do canal…** (ou da conversa, numa DM), **Onde os agentes respondem**:
- **Na conversa, como um chat**: as respostas vêm logo abaixo.
- **Em threads, uma por mensagem**: cada mensagem abre uma thread na lateral.

Dá pra abrir uma thread com **Responder na thread**; um agente numa thread lê só aquela.

## Durante a resposta
- Os passos aparecem enquanto o agente trabalha. **Parar** interrompe.
- **Tentar de novo** numa resposta que falhou ou foi interrompida.
- Chegou no teto: pausa e, se estava avançando, segue sozinho (até 2 vezes); depois pergunta: **Continuar** segue.
- Uma pergunta do agente: sua próxima mensagem ali é a resposta.
- **Ver recibo**: tokens, cache, tempo e o equivalente na API.

## Resumo
O **Resumo** no topo mostra o que a conversa já cobriu: as últimas 30 mensagens inteiras; passando de 50, o que sai vira resumo. Dá pra **Resumir agora** e editar.

## Anexos e ditado
- Até 10 imagens e 5 arquivos por mensagem (clipe, arrastar ou colar). De PDF, Word, planilha e texto o agente lê o texto; depois relê com ler_anexo.
- Ditado: o microfone do campo, ⌥ Espaço no Mac e Ctrl+Espaço nos outros. O áudio vira texto no próprio computador, sem internet. Ative em **Configurações › Geral › Ditado**.

## Quando dá errado
- "Interrompido: o app fechou no meio da resposta": ao abrir de novo ela continua sozinha (até 12 horas depois, com **Continuar sozinho** ligado); senão, **Tentar de novo**.
- Ninguém responde e aparece a nota de pausa: os agentes estão pausados (botão no topo da barra lateral).
