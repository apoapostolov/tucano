# Conversas, canais e threads
> Canais, DMs, threads, menções, quem responde, o trabalho que segue até terminar, quem entra sozinho, parar e tentar de novo, imagens e ditado.

## Canais e DMs
- **Canal**: o **+** ao lado de **Canais**, ⌘N (Ctrl+N) ou **Novo canal** no ⌘K. Nome em minúsculas e hífens ("Squad Pagamentos" vira squad-pagamentos).
- **DM**: a conversa com um agente só. Ele sempre responde ali. No menu do agente, **Mandar mensagem**.
- No menu do canal (botão direito nele na barra lateral): **Adicionar ou remover agentes…**, **Configurações do canal…** (nome, **Tema** e onde os agentes respondem), **Marcar como lido**, mover e agrupar, **Excluir canal…**.

## Quem responde num canal
- Com @handle, responde quem foi chamado.
- Sem menção, o **Roteador** lê a conversa e escolhe quem responde, pelo papel e pelos conectores de cada um.
- **Modo menção**: em **Agentes em #canal** (o **+** da pilha), marque o agente e o **Modo menção**: ele lê tudo e só responde quando é chamado com @, como um modelo caro num canal. Com todos em modo menção, a mensagem fica sem resposta e o app avisa.
- **Modo escuta**: no mesmo lugar. Antes de escolher quem responde, o **Jev** lê a mensagem e diz se ela pede o que só esse agente faz: só então ele entra. Sem a chave do TypeSafe, fica de fora.
- Quando mais de um vai responder, eles respondem um depois do outro: cada um lê o que os anteriores fizeram e faz a sua parte em cima.
- Quando um agente menciona outro, o roteador só chama quem tem algo a fazer: um "obrigado" não acorda ninguém.

## Até terminar
Toda mensagem vira um trabalho que segue até ficar pronto, sem você empurrar. Só para quando não avança mais, com a nota **Parei este trabalho** e **Continuar** (veja **limites**).

## Um agente que entra sozinho
Num canal, quando um agente termina sem passar a vez, outro pode entrar pra fazer algo da área dele (revisar, testar, publicar): aparece "**Rev** entrou" e o motivo. Um por vez, nunca pra comentar. Desliga na página do agente (**Entra sozinho quando algo é da área dele**) ou no menu do canal (**Agentes entram sozinhos**).

## Threads
Em **Configurações do canal…** (ou da conversa, numa DM), **Onde os agentes respondem**:
- **Na conversa, como um chat**: as respostas vêm logo abaixo.
- **Em threads, uma por mensagem**: cada mensagem abre uma thread na lateral.

Dá pra abrir uma thread com **Responder na thread**; um agente numa thread lê só aquela.

## Durante a resposta
- Os passos aparecem enquanto o agente trabalha. **Parar** interrompe; **Tentar de novo** refaz uma que falhou ou foi interrompida.
- Chegou no teto da resposta: ele pausa e, se estava avançando, segue sozinho (até 10 vezes). Depois pergunta: **Continuar** segue de onde parou.
- Uma pergunta do agente: sua próxima mensagem ali é a resposta.
- **Ver recibo**: tokens, cache, tempo e o equivalente na API.

## Resumo
O **Resumo** no topo mostra o que a conversa já cobriu: as últimas 30 mensagens inteiras; passando de 50, o que sai vira resumo. Dá pra **Resumir agora** e editar.

## Anexos e ditado
- Até 10 imagens e 5 arquivos por mensagem (clipe, arrastar ou colar). De PDF, Word, planilha e texto o agente lê o texto; depois relê com ler_anexo.
- Ditado: o microfone do campo, ⌥ Espaço no Mac e Ctrl+Espaço nos outros. O áudio vira texto no próprio computador, sem internet. Ative em **Configurações › Geral › Ditado**.

## Quando dá errado
- Sem internet, serviço ocupado ou a janela do plano: a resposta espera e tenta de novo sozinha (**Esperando pra tentar de novo**, com a hora).
- "Interrompido: o app fechou no meio da resposta": ao abrir de novo ela continua sozinha (até 12 horas depois, com **Continuar sozinho** ligado); senão, **Tentar de novo**.
- Ninguém responde e aparece a nota de pausa: os agentes estão pausados (botão no topo da barra lateral).
