/*
   backup.js  
   Sistema de backup local, histórico por usuário, restauração
   e logs — tudo usando LocalStorage.
   */

/* 
   CONFIGURAÇÕES PRINCIPAIS
    */

const BACKUP_KEY = "backups";     // Onde será salvo o HISTÓRICO de backups.
const LOGS_KEY = "logs";          // Onde será salvo o HISTÓRICO de logs.
const MAX_BACKUPS = 10;           // Quantos backups manter por usuário (últimos N).

/* 
   FUNÇÕES UTILITÁRIAS
    */

// Retorna a data e hora atual no formato ISO (2025-11-21T12:30:00Z)
function nowISO() {
    return new Date().toISOString();
}

// Faz parse seguro de JSON (impede erro caso esteja corrompido)
function safeParse(jsonStr) {
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        return null;
    }
}

/* 
   SISTEMA DE LOGS
   
   Serve para registrar ações importantes (backup criado, restaurado, login...)
   Isso ajuda em auditoria e depuração.
*/
function registrarLog(acao, detalhes = "") {
    const usuario = localStorage.getItem("userSession") || "anonimo";

    // Carrega logs existentes ou cria lista vazia
    const logs = safeParse(localStorage.getItem(LOGS_KEY)) || [];

    // Adiciona nova linha de log
    logs.push({
        acao,                // nome da ação
        detalhes,            // mais detalhes (ex.: username)
        horario: new Date().toLocaleString(), // formato amigável
        iso: nowISO(),       // formato ISO técnico
        usuario              // qual usuário gerou
    });

    // Salva de volta no localStorage
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

/* 
   FUNÇÃO PRINCIPAL: GERAR BACKUP
   
   - Cria um snapshot completo dos dados do usuário.
   - Guarda dentro de uma lista histórica.
   - Mantém limite de backups por usuário.
*/
function gerarBackup(tag = "") {
    const usuario = localStorage.getItem("userSession") || "global";

    // Captura os dados importantes do usuário
    const snapshot = {
        timestamp: nowISO(), // quando foi criado
        tag,                 // descrição opcional (ex.: "antes_exclusao")
        usuario,             // identifica o dono do backup

        // Aqui ficam armazenados os dados coletados
        data: {
            // Banco de usuários inteiro
            usersDB: safeParse(localStorage.getItem("usersDB")) || [],

            // Dados específicos do usuário atual
            livros: safeParse(localStorage.getItem(`livros_${usuario}`)) || null,
            progresso: safeParse(localStorage.getItem(`progresso_${usuario}`)) || null,
            anotacoes: safeParse(localStorage.getItem(`anotacoes_${usuario}`)) || null
        }
    };

    // Carrega o histórico total de backups
    const historico = safeParse(localStorage.getItem(BACKUP_KEY)) || [];

    // Adiciona o novo snapshot
    historico.push(snapshot);

    /* 
       Limitar backups: mantém apenas os últimos MAX_BACKUPS
       para cada usuário.
    */
    const porUsuario = {};

    // Percorremos do MAIS RECENTE para o MAIS ANTIGO
    for (let i = historico.length - 1; i >= 0; i--) {
        const item = historico[i];
        const u = item.usuario || "global";

        if (!porUsuario[u]) porUsuario[u] = [];

        // Só mantém os últimos MAX_BACKUPS
        if (porUsuario[u].length < MAX_BACKUPS) {
            porUsuario[u].push(item);
        }
    }

    // Monta novamente o histórico final, em ordem cronológica
    let novoHistorico = [];
    for (const u in porUsuario) {
        const arr = porUsuario[u].reverse(); // volta à ordem normal
        novoHistorico = novoHistorico.concat(arr);
    }

    // Salvando o histórico filtrado
    localStorage.setItem(BACKUP_KEY, JSON.stringify(novoHistorico));

    // Registramos o log da ação
    registrarLog("backup_criado", `tag=${tag}`);

    return snapshot;
}

/* 
   LISTAR BACKUPS
   
   - Retorna todos os backups ou apenas os de um usuário.
*/
function listarBackups(usuario = null) {
    const historico = safeParse(localStorage.getItem(BACKUP_KEY)) || [];

    // Se não especificar usuário → retorna tudo
    if (!usuario) return historico;

    // Filtra por usuário
    return historico.filter(b => b.usuario === usuario);
}

/* 
   RESTAURAR BACKUP
   
   - Restaura dados salvo em um snapshot.
   - Pode restaurar por índice ou por timestamp.
*/
function restaurarBackup(usuario, indexOrTimestamp) {
    const todos = listarBackups();
    const porUsuario = todos.filter(b => b.usuario === usuario);

    if (!porUsuario.length)
        return { success: false, message: "Nenhum backup encontrado para este usuário." };

    let target = null;

    // Se for número → pega índice
    if (typeof indexOrTimestamp === "number") {
        target = porUsuario[indexOrTimestamp];
    }
    // Se for string → busca timestamp
    else if (typeof indexOrTimestamp === "string") {
        target = porUsuario.find(b => b.timestamp === indexOrTimestamp);
    }
    // Se nada for passado → último backup
    else {
        target = porUsuario[porUsuario.length - 1];
    }

    if (!target)
        return { success: false, message: "Backup especificado não encontrado." };

    // RESTAURANDO CADA PARTE DO BACKUP
    const data = target.data;

    // Restaura banco de usuários
    if (data.usersDB !== null) {
        localStorage.setItem("usersDB", JSON.stringify(data.usersDB));
    }

    // Restaura dados específicos
    if (data.livros !== null) {
        localStorage.setItem(`livros_${usuario}`, JSON.stringify(data.livros));
    }
    if (data.progresso !== null) {
        localStorage.setItem(`progresso_${usuario}`, JSON.stringify(data.progresso));
    }
    if (data.anotacoes !== null) {
        localStorage.setItem(`anotacoes_${usuario}`, JSON.stringify(data.anotacoes));
    }

    registrarLog("backup_restaurado", `timestamp=${target.timestamp}`);

    return { success: true, message: "Backup restaurado com sucesso!" };
}

/* 
   BAIXAR BACKUP COMO ARQUIVO JSON
   
   - Permite ao usuário baixar o backup em formato .json.
*/
function baixarBackupComoArquivo(usuario, indexOrTimestamp) {
    const todos = listarBackups();
    const porUsuario = todos.filter(b => b.usuario === usuario);

    if (!porUsuario.length)
        return { success: false, message: "Nenhum backup para este usuário." };

    let target = null;

    if (typeof indexOrTimestamp === "number") {
        target = porUsuario[indexOrTimestamp];
    } else if (typeof indexOrTimestamp === "string") {
        target = porUsuario.find(b => b.timestamp === indexOrTimestamp);
    } else {
        target = porUsuario[porUsuario.length - 1];
    }

    if (!target)
        return { success: false, message: "Backup não encontrado." };

    // Converte para texto formatado
    const dataStr = JSON.stringify(target, null, 2);

    // Cria arquivo JSON para download
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${usuario}_${target.timestamp}.json`;
    a.click();

    URL.revokeObjectURL(url);

    registrarLog("backup_baixado", `timestamp=${target.timestamp}`);

    return { success: true };
}

/* 
   LIMPAR BACKUPS
   
   - Apaga todos os backups ou somente os de um usuário.
*/
function limparBackups(usuario = null) {
    if (!usuario) {
        // Apaga todos os backups de todos os usuários
        localStorage.removeItem(BACKUP_KEY);
        registrarLog("backups_limpos", "todos removidos");
        return;
    }

    // Mantém apenas backups de outros usuários
    const historico = safeParse(localStorage.getItem(BACKUP_KEY)) || [];
    const novo = historico.filter(b => b.usuario !== usuario);

    localStorage.setItem(BACKUP_KEY, JSON.stringify(novo));
    registrarLog("backups_limpos", `usuario=${usuario}`);
}

/* 
   EXPORTANDO FUNÇÕES
   
   - Assim você pode chamar no console:
     backup.gerarBackup()
     backup.listarBackups()
     backup.restaurarBackup()
*/
window.backup = {
    gerarBackup,
    listarBackups,
    restaurarBackup,
    baixarBackupComoArquivo,
    limparBackups,
    registrarLog
};
