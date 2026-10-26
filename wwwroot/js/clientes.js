/**
 * apiDados Console — Gerenciamento de Clientes (MVP)
 * Arquitetura Frontend: JavaScript Vanilla (Puro)
 * Estilização de Desenvolvimento com Auditoria de Rede e Telemetria
 */

'use strict';

(function () {
  // Configuração da URL Base da API REST
  const BASE_URL = window.location.origin && window.location.origin.startsWith('http')
    ? window.location.origin
    : 'http://localhost:5289';

  const API_CLIENTE_URL = `${BASE_URL}/api/cliente`;

  // Estado da Aplicação
  let clientes = [];
  let idEmEdicao = null;
  let idParaExcluir = null;
  let termoPesquisa = '';

  // Elementos do DOM
  const formCliente = document.getElementById('form-cliente');
  const inputNome = document.getElementById('cliente-nome');
  const inputEmail = document.getElementById('cliente-email');
  const inputTelefone = document.getElementById('cliente-telefone');
  const btnSalvar = document.getElementById('btn-salvar');
  const btnSalvarText = document.getElementById('btn-salvar-text');
  const btnSalvarIcon = document.getElementById('btn-salvar-icon');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnLimpar = document.getElementById('btn-limpar');
  const btnRecarregar = document.getElementById('btn-recarregar');
  const iconRefresh = document.getElementById('icon-refresh');
  const formActionBadge = document.getElementById('form-action-badge');

  // Tabela e Filtro
  const tabelaCorpo = document.getElementById('tabela-clientes-corpo');
  const filtroPesquisa = document.getElementById('filtro-pesquisa');

  // Métricas e Diagnósticos
  const cardTotalClientes = document.getElementById('card-total-clientes');
  const cardPingLatency = document.getElementById('card-ping-latency');
  const tagLatency = document.getElementById('tag-latency');
  const devBanner = document.getElementById('dev-banner');
  const bannerStatusTitle = document.getElementById('banner-status-title');
  const bannerStatusDesc = document.getElementById('banner-status-desc');

  // Terminal de Auditoria
  const consoleStream = document.getElementById('dev-console-stream');
  const btnLimparConsole = document.getElementById('btn-limpar-console');

  // Modal de Confirmação
  const modalConfirmacao = document.getElementById('modal-confirmacao');
  const modalClienteId = document.getElementById('modal-cliente-id');
  const btnModalConfirmar = document.getElementById('btn-modal-confirmar');
  const btnModalCancelar = document.getElementById('btn-modal-cancelar');

  // Toasts
  const toastContainer = document.getElementById('toast-container');

  // ==========================================================================
  // Helper: Ícones Vetoriais SVG (Sem emojis)
  // ==========================================================================
  const ICONS = {
    check: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    alert: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    info: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    edit: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
    trash: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    plus: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    save: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
    close: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
  };

  /**
   * Registra requisição HTTP no Terminal de Auditoria (Telemetry Console)
   */
  function logHttpTelemetry(metodo, rota, status, mensagem, duracaoMs) {
    if (!consoleStream) return;

    const agora = new Date();
    const horario = agora.toTimeString().split(' ')[0] + '.' + String(agora.getMilliseconds()).padStart(3, '0');

    const entry = document.createElement('div');
    entry.className = 'console-entry';

    const spanTime = document.createElement('span');
    spanTime.className = 'console-time';
    spanTime.textContent = `[${horario}]`;

    const spanMethod = document.createElement('span');
    spanMethod.className = `method-pill method-${metodo.toLowerCase()}`;
    spanMethod.textContent = metodo;

    const spanText = document.createElement('span');
    const statusClass = status >= 200 && status < 300 ? 'console-status-ok' : 'console-status-err';
    spanText.innerHTML = `<code>${rota}</code> &rarr; <span class="${statusClass}">${status}</span> ${mensagem}`;

    const spanLatency = document.createElement('span');
    spanLatency.className = 'console-latency';
    spanLatency.textContent = duracaoMs !== undefined ? `${duracaoMs}ms` : '';

    entry.appendChild(spanTime);
    entry.appendChild(spanMethod);
    entry.appendChild(spanText);
    entry.appendChild(spanLatency);

    consoleStream.appendChild(entry);
    consoleStream.scrollTop = consoleStream.scrollHeight;

    // Atualiza badges de latência
    if (duracaoMs !== undefined) {
      if (cardPingLatency) cardPingLatency.textContent = `${duracaoMs}ms`;
      if (tagLatency) tagLatency.textContent = `LATÊNCIA: ${duracaoMs}ms`;
    }
  }

  /**
   * Exibe mensagens Toast flutuantes de feedback
   */
  function exibirToast(mensagem, tipo = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;

    const iconHtml = tipo === 'success' ? ICONS.check : tipo === 'error' ? ICONS.alert : ICONS.info;

    toast.innerHTML = `
      <div class="toast-icon">${iconHtml}</div>
      <div class="toast-content">${mensagem}</div>
      <button type="button" class="toast-close" aria-label="Fechar notificação">${ICONS.close}</button>
    `;

    const btnClose = toast.querySelector('.toast-close');
    btnClose.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    });

    toastContainer.appendChild(toast);

    // Animação de entrada
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-destruição após 4.5 segundos
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
      }
    }, 4500);
  }

  /**
   * Atualiza o banner de diagnóstico e status do backend
   */
  function atualizarStatusIntegracao(conectado, mensagemErro) {
    if (!devBanner) return;

    if (conectado) {
      devBanner.classList.remove('disconnected');
      devBanner.classList.add('connected');
      if (bannerStatusTitle) {
        bannerStatusTitle.textContent = 'Backend Conectado & Banco SQLite Ativo';
      }
      if (bannerStatusDesc) {
        bannerStatusDesc.innerHTML = 'Comunicação estabelecida com ASP.NET Core Kestrel e banco de dados SQLite (<code>api-clientes.db</code>). Todas as operações REST estão operacionais.';
      }
    } else {
      devBanner.classList.remove('connected');
      devBanner.classList.add('disconnected');
      if (bannerStatusTitle) {
        bannerStatusTitle.textContent = 'Falha na Conexão com o Backend';
      }
      if (bannerStatusDesc) {
        bannerStatusDesc.innerHTML = `Não foi possível comunicar com o endpoint em <code>${BASE_URL}</code>. ${mensagemErro || 'Verifique se o backend está em execução com o comando <code>dotnet run</code>.'}`;
      }
      if (cardPingLatency) cardPingLatency.textContent = 'Falha';
      if (tagLatency) tagLatency.textContent = 'LATÊNCIA: TIMEOUT';
    }
  }

  /**
   * Carrega os clientes do backend via GET /api/cliente
   */
  async function carregarClientes() {
    const tInicio = performance.now();
    if (iconRefresh) iconRefresh.classList.add('spin-anim');

    try {
      const response = await fetch(API_CLIENTE_URL, {
        headers: { 'Accept': 'application/json' }
      });

      const duracao = Math.round(performance.now() - tInicio);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      clientes = await response.json();
      atualizarStatusIntegracao(true);
      logHttpTelemetry('GET', '/api/cliente', response.status, `OK (${clientes.length} registros obtidos)`, duracao);
      renderizarTabela();
    } catch (erro) {
      const duracao = Math.round(performance.now() - tInicio);
      console.error('Erro ao obter clientes:', erro);
      atualizarStatusIntegracao(false, erro.message);
      logHttpTelemetry('GET', '/api/cliente', 0, `Falha de Conexão: ${erro.message}`, duracao);
      renderizarTabela(erro.message);
      exibirToast(`Falha ao conectar com a API: ${erro.message}`, 'error');
    } finally {
      if (iconRefresh) {
        setTimeout(() => iconRefresh.classList.remove('spin-anim'), 400);
      }
    }
  }

  /**
   * Renderiza a tabela de clientes filtrada
   */
  function renderizarTabela(mensagemErro) {
    if (!tabelaCorpo) return;
    tabelaCorpo.innerHTML = '';

    // Atualiza contadores
    if (cardTotalClientes) {
      cardTotalClientes.textContent = clientes.length.toString();
    }

    if (mensagemErro) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="5" class="table-empty-state">
          <div class="empty-state-inner">
            <div class="empty-state-icon" style="color: var(--accent-rose);">${ICONS.alert}</div>
            <strong style="color: var(--accent-rose);">Erro na comunicação com o banco de dados</strong>
            <span>${mensagemErro}</span>
          </div>
        </td>
      `;
      tabelaCorpo.appendChild(tr);
      return;
    }

    // Filtragem em tempo real
    const filtrados = clientes.filter(c => {
      if (!termoPesquisa) return true;
      const t = termoPesquisa.toLowerCase();
      return (
        String(c.id).includes(t) ||
        (c.nome && c.nome.toLowerCase().includes(t)) ||
        (c.email && c.email.toLowerCase().includes(t)) ||
        (c.telefone && c.telefone.toLowerCase().includes(t))
      );
    });

    if (filtrados.length === 0) {
      const tr = document.createElement('tr');
      const mensagemVazia = termoPesquisa 
        ? `Nenhum cliente corresponde ao filtro "${termoPesquisa}".`
        : 'Nenhum cliente cadastrado no banco de dados. Utilize o formulário acima para registrar.';

      tr.innerHTML = `
        <td colspan="5" class="table-empty-state">
          <div class="empty-state-inner">
            <div class="empty-state-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <strong>Nenhum registro encontrado</strong>
            <span>${mensagemVazia}</span>
          </div>
        </td>
      `;
      tabelaCorpo.appendChild(tr);
      return;
    }

    filtrados.forEach(cliente => {
      const tr = document.createElement('tr');

      // ID com Badge
      const tdId = document.createElement('td');
      const badgeId = document.createElement('span');
      badgeId.className = 'badge-id';
      badgeId.textContent = `#${String(cliente.id).padStart(2, '0')}`;
      tdId.appendChild(badgeId);

      // Nome com Avatar
      const tdNome = document.createElement('td');
      const nameWrapper = document.createElement('div');
      nameWrapper.className = 'client-name-cell';

      const avatar = document.createElement('span');
      avatar.className = 'client-avatar';
      avatar.textContent = (cliente.nome || 'C').charAt(0).toUpperCase();

      const nameText = document.createElement('span');
      nameText.style.fontWeight = '600';
      nameText.style.color = 'var(--text-main)';
      nameText.textContent = cliente.nome;

      const badgeSql = document.createElement('span');
      badgeSql.className = 'badge-sql';
      badgeSql.textContent = 'SQL';

      nameWrapper.appendChild(avatar);
      nameWrapper.appendChild(nameText);
      nameWrapper.appendChild(badgeSql);
      tdNome.appendChild(nameWrapper);

      // E-mail
      const tdEmail = document.createElement('td');
      tdEmail.style.fontFamily = 'var(--font-mono)';
      tdEmail.style.fontSize = '0.8rem';
      tdEmail.textContent = cliente.email;

      // Telefone
      const tdTelefone = document.createElement('td');
      tdTelefone.style.fontFamily = 'var(--font-mono)';
      tdTelefone.style.fontSize = '0.8rem';
      tdTelefone.textContent = cliente.telefone;

      // Ações
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'actions-cell';

      const btnEditar = document.createElement('button');
      btnEditar.type = 'button';
      btnEditar.className = 'btn btn-action-edit btn-sm';
      btnEditar.innerHTML = `${ICONS.edit} Editar`;
      btnEditar.title = `Editar dados do cliente #${cliente.id}`;
      btnEditar.addEventListener('click', () => iniciarEdicao(cliente.id));

      const btnExcluir = document.createElement('button');
      btnExcluir.type = 'button';
      btnExcluir.className = 'btn btn-action-delete btn-sm';
      btnExcluir.innerHTML = `${ICONS.trash} Excluir`;
      btnExcluir.title = `Remover cliente #${cliente.id}`;
      btnExcluir.addEventListener('click', () => abrirModalExclusao(cliente.id));

      tdAcoes.appendChild(btnEditar);
      tdAcoes.appendChild(btnExcluir);

      tr.appendChild(tdId);
      tr.appendChild(tdNome);
      tr.appendChild(tdEmail);
      tr.appendChild(tdTelefone);
      tr.appendChild(tdAcoes);

      tabelaCorpo.appendChild(tr);
    });
  }

  /**
   * Preenche o formulário para edição do registro
   */
  function iniciarEdicao(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;

    idEmEdicao = id;
    inputNome.value = cliente.nome;
    inputEmail.value = cliente.email;
    inputTelefone.value = cliente.telefone;

    if (formActionBadge) {
      formActionBadge.innerHTML = `<span class="method-pill method-put">PUT /api/cliente/${id}</span>`;
    }

    if (btnSalvarText) btnSalvarText.textContent = `Salvar Alterações (#${id})`;
    if (btnSalvarIcon) btnSalvarIcon.innerHTML = ICONS.save;
    if (btnCancelar) btnCancelar.style.display = 'inline-flex';

    formCliente.scrollIntoView({ behavior: 'smooth', block: 'start' });
    inputNome.focus();

    exibirToast(`Modo de edição ativado para o cliente #${id}.`, 'info');
  }

  /**
   * Limpa o formulário e retorna ao estado de inserção (POST)
   */
  function limparFormulario() {
    idEmEdicao = null;
    formCliente.reset();

    if (formActionBadge) {
      formActionBadge.innerHTML = `<span class="method-pill method-post">POST /api/cliente</span>`;
    }

    if (btnSalvarText) btnSalvarText.textContent = 'Cadastrar Registro';
    if (btnSalvarIcon) btnSalvarIcon.innerHTML = ICONS.plus;
    if (btnSalvar) btnSalvar.disabled = false;
    if (btnCancelar) btnCancelar.style.display = 'none';
  }

  /**
   * Envia os dados para a API (POST se novo, PUT se atualização)
   */
  async function salvarCliente(event) {
    event.preventDefault();

    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();
    const telefone = inputTelefone.value.trim();

    if (!nome || !email || !telefone) {
      exibirToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const payload = { nome, email, telefone };
    btnSalvar.disabled = true;
    const tInicio = performance.now();

    try {
      if (idEmEdicao !== null) {
        // Atualização via PUT /api/cliente/{id}
        btnSalvarText.textContent = 'Persistindo alterações...';
        const urlPut = `${API_CLIENTE_URL}/${idEmEdicao}`;

        const response = await fetch(urlPut, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const duracao = Math.round(performance.now() - tInicio);

        if (!response.ok) {
          const erroData = await response.json().catch(() => ({}));
          throw new Error(erroData.mensagem || `Status ${response.status}`);
        }

        const atualizado = await response.json();
        logHttpTelemetry('PUT', `/api/cliente/${idEmEdicao}`, response.status, `Atualizado "${atualizado.nome}"`, duracao);
        exibirToast(`Cliente #${atualizado.id} atualizado com sucesso no SQLite!`, 'success');
      } else {
        // Criação via POST /api/cliente
        btnSalvarText.textContent = 'Inserindo no banco...';

        const response = await fetch(API_CLIENTE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const duracao = Math.round(performance.now() - tInicio);

        if (!response.ok) {
          const erroData = await response.json().catch(() => ({}));
          throw new Error(erroData.mensagem || `Status ${response.status}`);
        }

        const novo = await response.json();
        logHttpTelemetry('POST', '/api/cliente', response.status, `Criado ID #${novo.id} ("${novo.nome}")`, duracao);
        exibirToast(`Cliente #${novo.id} cadastrado com sucesso no SQLite!`, 'success');
      }

      limparFormulario();
      await carregarClientes();
    } catch (erro) {
      const duracao = Math.round(performance.now() - tInicio);
      console.error('Erro ao salvar cliente:', erro);
      logHttpTelemetry(idEmEdicao ? 'PUT' : 'POST', '/api/cliente', 0, `Erro: ${erro.message}`, duracao);
      exibirToast(`Erro na operação: ${erro.message}`, 'error');
      btnSalvar.disabled = false;
      btnSalvarText.textContent = idEmEdicao !== null ? `Salvar Alterações (#${idEmEdicao})` : 'Cadastrar Registro';
    }
  }

  /**
   * Modal de confirmação de exclusão
   */
  function abrirModalExclusao(id) {
    idParaExcluir = id;
    if (modalClienteId) modalClienteId.textContent = `#${id}`;
    if (modalConfirmacao) modalConfirmacao.classList.add('active');
  }

  function fecharModalExclusao() {
    idParaExcluir = null;
    if (modalConfirmacao) modalConfirmacao.classList.remove('active');
  }

  /**
   * Executa a remoção via DELETE /api/cliente/{id}
   */
  async function confirmarExclusao() {
    if (idParaExcluir === null) return;
    const id = idParaExcluir;
    fecharModalExclusao();

    const tInicio = performance.now();
    try {
      const response = await fetch(`${API_CLIENTE_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      const duracao = Math.round(performance.now() - tInicio);

      if (!response.ok) {
        const erroData = await response.json().catch(() => ({}));
        throw new Error(erroData.mensagem || `Status ${response.status}`);
      }

      logHttpTelemetry('DELETE', `/api/cliente/${id}`, response.status, `Registro removido`, duracao);
      exibirToast(`Cliente #${id} removido com sucesso da base de dados.`, 'success');

      if (idEmEdicao === id) {
        limparFormulario();
      }

      await carregarClientes();
    } catch (erro) {
      const duracao = Math.round(performance.now() - tInicio);
      console.error('Erro ao remover cliente:', erro);
      logHttpTelemetry('DELETE', `/api/cliente/${id}`, 0, `Erro ao excluir: ${erro.message}`, duracao);
      exibirToast(`Erro ao excluir: ${erro.message}`, 'error');
    }
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================
  formCliente.addEventListener('submit', salvarCliente);
  btnCancelar.addEventListener('click', limparFormulario);
  btnLimpar.addEventListener('click', limparFormulario);

  if (btnRecarregar) {
    btnRecarregar.addEventListener('click', carregarClientes);
  }

  if (filtroPesquisa) {
    filtroPesquisa.addEventListener('input', (e) => {
      termoPesquisa = e.target.value.trim();
      renderizarTabela();
    });
  }

  if (btnLimparConsole) {
    btnLimparConsole.addEventListener('click', () => {
      if (consoleStream) consoleStream.innerHTML = '';
      exibirToast('Terminal de auditoria limpo.', 'info');
    });
  }

  if (btnModalConfirmar) {
    btnModalConfirmar.addEventListener('click', confirmarExclusao);
  }

  if (btnModalCancelar) {
    btnModalCancelar.addEventListener('click', fecharModalExclusao);
  }

  if (modalConfirmacao) {
    modalConfirmacao.addEventListener('click', (e) => {
      if (e.target === modalConfirmacao) fecharModalExclusao();
    });
  }

  // Inicialização ao carregar a página
  carregarClientes();
})();
