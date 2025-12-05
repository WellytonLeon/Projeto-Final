drop database projeto_final;
create database projeto_final;
use projeto_final;
create table User(
    id_user int primary key not null auto_increment,
    nome varchar(100) not null,
    email varchar(100) not null unique,
    senha char(50) not null
);
create table Categoria(
    id_categoria INT PRIMARY KEY NOT NULL auto_increment,
    nome VARCHAR(50) UNIQUE NOT NULL
);
CREATE TABLE Autor(
    id_autor INT PRIMARY KEY NOT NULL auto_increment,
    nome VARCHAR(150) NOT NULL
);
CREATE TABLE Livro (
    id_livro INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    id_categoria INT,
    id_autor INT,
    id_user INT NOT NULL,  -- Dono do livro
    descricao TEXT,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria) ON DELETE SET NULL,
    FOREIGN KEY (id_autor) REFERENCES Autor(id_autor) ON DELETE SET NULL,
    FOREIGN KEY (id_user) REFERENCES User(id_user) ON DELETE CASCADE
);


CREATE TABLE Avaliacoes (
    avaliacao_id INT AUTO_INCREMENT PRIMARY KEY,
    id_livro INT,
    id_user INT,
    nota INT CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_livro) REFERENCES Livro(id_livro),
    FOREIGN KEY (id_user) REFERENCES User(id_user)
);

INSERT INTO Categoria (nome) VALUES
('Romance'), ('Ficção Científica'), ('Fantasia'), ('Suspense / Thriller'),
('Mistério / Policial'), ('Terror / Horror'), ('Drama'), ('Ação e Aventura'),
('Histórico'), ('Biografia / Autobiografia'), ('Memórias'), ('Autoajuda'),
('Desenvolvimento Pessoal'), ('Negócios / Empreendedorismo'), ('Filosofia'),
('Psicologia'), ('Religião / Espiritualidade'), ('Ciência e Tecnologia'),
('Educação / Pedagogia'), ('Literatura Infantil');

INSERT INTO Autor (nome) VALUES
('Stephen King'), ('Agatha Christie'), ('J. K. Rowling'),
('George R. R. Martin'), ('J. R. R. Tolkien'), ('Isaac Asimov'),
('Arthur Conan Doyle'), ('Neil Gaiman'), ('Jane Austen'),
('Machado de Assis'), ('Clarice Lispector'), ('Gabriel García Márquez'),
('Ernest Hemingway'), ('Haruki Murakami'), ('Edgar Allan Poe'),
('Franz Kafka'), ('Margaret Atwood'), ('H. P. Lovecraft'),
('Dan Brown'), ('Victor Hugo');

INSERT INTO Livro (nome, descricao, id_autor, id_categoria,id_user) VALUES
('O Senhor dos Anéis', 'Uma obra épica de fantasia, ambientada na Terra-média, onde a luta entre o bem e o mal atinge seu ápice.',1,2,1),
('1984', 'Um romance distópico que descreve uma sociedade totalitária onde o governo controla todos os aspectos da vida humana.',2,4,1);

INSERT INTO User (nome, email, senha) VALUES
('João Silva', 'joao@exemplo.com', 'senha123'),
('Maria Oliveira', 'maria@exemplo.com', 'senha456');

INSERT INTO Avaliacoes (id_livro, id_user, nota, comentario) VALUES
(1, 1, 5, 'Excelente livro, com uma narrativa envolvente e personagens cativantes!'),
(2, 2, 4, 'Uma crítica interessante ao totalitarismo, mas achei o ritmo um pouco lento em algumas partes.');

CREATE TABLE LogAlteracoes (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    tabela_afetada VARCHAR(100),
    operacao VARCHAR(50),  -- 'INSERT', 'UPDATE', 'DELETE'
    registro_id INT,       -- ID do registro alterado
    id_user INT,           -- ID do usuário que fez a alteração
    dados_antigos TEXT,    -- Para armazenar dados antigos (no caso de UPDATE e DELETE)
    dados_novos TEXT,      -- Para armazenar dados novos (no caso de INSERT e UPDATE)
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER $$

CREATE TRIGGER LogInsertLivros
AFTER INSERT ON Livro
FOR EACH ROW
BEGIN
    DECLARE nomeAutor VARCHAR(150);
    DECLARE nomeCategoria VARCHAR(50);

    SELECT COALESCE((SELECT nome FROM Autor WHERE id_autor = NEW.id_autor LIMIT 1), '(desconhecido)') INTO nomeAutor;

    SELECT COALESCE((SELECT nome FROM Categoria WHERE id_categoria = NEW.id_categoria LIMIT 1), '(desconhecido)') INTO nomeCategoria;

    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_novos, id_user)
    VALUES (
        'Livro', 
        'INSERT', 
        NEW.id_livro, 
        CONCAT('Título: ', NEW.nome, ', Autor: ', nomeAutor, ', Categoria: ', nomeCategoria, ', Descrição: ', NEW.descricao),
        NULL
    );
END $$

CREATE TRIGGER LogUpdateLivros
AFTER UPDATE ON Livro
FOR EACH ROW
BEGIN
    DECLARE oldAutor VARCHAR(150);
    DECLARE oldCategoria VARCHAR(50);
    DECLARE newAutor VARCHAR(150);
    DECLARE newCategoria VARCHAR(50);

    SELECT COALESCE((SELECT nome FROM Autor WHERE id_autor = OLD.id_autor LIMIT 1), '(desconhecido)') INTO oldAutor;

    SELECT COALESCE((SELECT nome FROM Categoria WHERE id_categoria = OLD.id_categoria LIMIT 1), '(desconhecido)') INTO oldCategoria;

    SELECT COALESCE((SELECT nome FROM Autor WHERE id_autor = NEW.id_autor LIMIT 1), '(desconhecido)') INTO newAutor;

    SELECT COALESCE((SELECT nome FROM Categoria WHERE id_categoria = NEW.id_categoria LIMIT 1), '(desconhecido)') INTO newCategoria;

    INSERT INTO LogAlteracoes 
        (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    VALUES (
        'Livro', 
        'UPDATE', 
        OLD.id_livro,
        CONCAT('Título: ', OLD.nome, ', Autor: ', oldAutor, ', Categoria: ', oldCategoria, ', Descrição: ', OLD.descricao),
        CONCAT('Título: ', NEW.nome, ', Autor: ', newAutor, ', Categoria: ', newCategoria, ', Descrição: ', NEW.descricao),
        NULL
    );
END $$

CREATE TRIGGER LogDeleteLivros
AFTER DELETE ON Livro
FOR EACH ROW
BEGIN
    DECLARE nomeAutor VARCHAR(150);
    DECLARE nomeCategoria VARCHAR(50);

    SELECT COALESCE((SELECT nome FROM Autor WHERE id_autor = OLD.id_autor LIMIT 1), '(desconhecido)') INTO nomeAutor;

    SELECT COALESCE((SELECT nome FROM Categoria WHERE id_categoria = OLD.id_categoria LIMIT 1), '(desconhecido)') INTO nomeCategoria;

    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    VALUES (
        'Livro', 
        'DELETE', 
        OLD.id_livro,
        CONCAT('Título: ', OLD.nome, ', Autor: ', nomeAutor, ', Categoria: ', nomeCategoria, ', Descrição: ', OLD.descricao),
        NULL,NULL
    );
END $$

DELIMITER ; 

DELIMITER $$
CREATE TRIGGER LogInsertUsuarios
AFTER INSERT ON User
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_novos, id_user)
    VALUES ('User', 'INSERT', NEW.id_user, CONCAT('Nome: ', NEW.nome, ', Email: ', NEW.email), NULL);
END $$

CREATE TRIGGER LogUpdateUsuarios
AFTER UPDATE ON User
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes
        (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    VALUES
        (
            'User',
            'UPDATE',
            OLD.id_user,
            CONCAT('Nome: ', OLD.nome, ', Email: ', OLD.email),
            CONCAT('Nome: ', NEW.nome, ', Email: ', NEW.email),
            NULL
        );
END $$

CREATE TRIGGER LogDeleteUsuarios
AFTER DELETE ON User
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes
        (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    VALUES
        (
            'User',
            'DELETE',
            OLD.id_user,
            CONCAT('Nome: ', OLD.nome, ', Email: ', OLD.email),
            NULL,
            NULL
        );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER LogInsertCategoria
AFTER INSERT ON Categoria
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_novos)
    VALUES ('Categoria', 'INSERT', NEW.id_categoria, CONCAT('Nome: ', NEW.nome));
END $$

CREATE TRIGGER LogUpdateCategoria
AFTER UPDATE ON Categoria
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos)
    VALUES ('Categoria', 'UPDATE', OLD.id_categoria, CONCAT('Nome: ', OLD.nome), CONCAT('Nome: ', NEW.nome));
END $$

CREATE TRIGGER LogDeleteCategoria
AFTER DELETE ON Categoria
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos)
    VALUES ('Categoria', 'DELETE', OLD.id_categoria, CONCAT('Nome: ', OLD.nome));
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER LogInsertAutor
AFTER INSERT ON Autor
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_novos)
    VALUES ('Autor', 'INSERT', NEW.id_autor, CONCAT('Nome: ', NEW.nome));
END $$

CREATE TRIGGER LogUpdateAutor
AFTER UPDATE ON Autor
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos)
    VALUES ('Autor', 'UPDATE', OLD.id_autor, CONCAT('Nome: ', OLD.nome), CONCAT('Nome: ', NEW.nome));
END $$

CREATE TRIGGER LogDeleteAutor
AFTER DELETE ON Autor
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos)
    VALUES ('Autor', 'DELETE', OLD.id_autor, CONCAT('Nome: ', OLD.nome));
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER LogInsertAvaliacoes
AFTER INSERT ON Avaliacoes
FOR EACH ROW
BEGIN
    DECLARE tituloLivro VARCHAR(200);
    DECLARE nomeUsuario VARCHAR(100);

    SELECT COALESCE((SELECT nome FROM Livro WHERE id_livro = NEW.id_livro LIMIT 1), '(desconhecido)') INTO tituloLivro;

    SELECT COALESCE((SELECT nome FROM User WHERE id_user = NEW.id_user LIMIT 1), '(desconhecido)') INTO nomeUsuario;

    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_novos, id_user)
    VALUES (
        'Avaliacoes', 'INSERT', NEW.avaliacao_id, CONCAT('Livro: ', IFNULL(tituloLivro,'(desconhecido)'), 
        ', Usuario: ', IFNULL(nomeUsuario,'(desconhecido)'), ', Nota: ', NEW.nota, ', Comentario: ', IFNULL(NEW.comentario,'')), NEW.id_user
    );
END $$

CREATE TRIGGER LogUpdateAvaliacoes
AFTER UPDATE ON Avaliacoes
FOR EACH ROW
BEGIN
    DECLARE tituloLivro VARCHAR(200);
    DECLARE nomeUsuario VARCHAR(100);

    SELECT COALESCE((SELECT nome FROM Livro WHERE id_livro = NEW.id_livro LIMIT 1), '(desconhecido)') INTO tituloLivro;

    SELECT COALESCE((SELECT nome FROM User WHERE id_user = NEW.id_user LIMIT 1), '(desconhecido)') INTO nomeUsuario;

    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    VALUES (
        'Avaliacoes',
        'UPDATE',
        OLD.avaliacao_id,
        CONCAT('Livro: ', IFNULL(tituloLivro,'(desconhecido)'), ', Usuario: ', IFNULL(nomeUsuario,'(desconhecido)'), 
        ', Nota: ', OLD.nota, ', Comentario: ', IFNULL(OLD.comentario,'')),
        CONCAT('Livro: ', IFNULL(tituloLivro,'(desconhecido)'), ', Usuario: ', IFNULL(nomeUsuario,'(desconhecido)'), 
        ', Nota: ', NEW.nota, ', Comentario: ', IFNULL(NEW.comentario,'')),
        NULL
    );
END $$

CREATE TRIGGER LogDeleteAvaliacoes
AFTER DELETE ON Avaliacoes
FOR EACH ROW
BEGIN
    DECLARE tituloLivro VARCHAR(200);
    DECLARE nomeUsuario VARCHAR(100);

    SELECT COALESCE((SELECT nome FROM Livro WHERE id_livro = OLD.id_livro LIMIT 1), '(desconhecido)') INTO tituloLivro;

    SELECT COALESCE((SELECT nome FROM User WHERE id_user = OLD.id_user LIMIT 1), '(desconhecido)') INTO nomeUsuario;

    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos, id_user)
    VALUES (
        'Avaliacoes',
        'DELETE',
        OLD.avaliacao_id,
        CONCAT('Livro: ', IFNULL(tituloLivro,'(desconhecido)'), ', Usuario: ', IFNULL(nomeUsuario,'(desconhecido)'), 
        ', Nota: ', OLD.nota, ', Comentario: ', IFNULL(OLD.comentario,'')),
        NULL,
        NULL
    );
END $$

DELIMITER ;


create table sessao (
    id_sessao int primary key auto_increment,
    id_user int not null,
    token varchar(255) not null unique,
    inicio datetime not null DEFAULT CURRENT_TIMESTAMP,
    fim datetime null,
    ativo boolean default true,

    foreign key (id_user) references User(id_user)
);

insert into sessao (id_user, token)
values (1, 'token_exemplo_123');

update sessao
set ativo = false,
    fim = current_timestamp
where token = 'token_exemplo_123'
    and ativo = true;

-- encerrar todas as sessões do usuário (opcional)

update sessao
set ativo = false,
    fim = current_timestamp
where id_user = 1
    and ativo = true;

-- verificar se a sessão está ativa (se precisar)

select * from sessao
where token = 'token_exemplo_123'
    and ativo = true;

create table if not exists senha_reset (
    id_reset int primary key auto_increment,
    id_user int not null,
    token_hash varchar(64) not null,
    criado_em datetime not null default current_timestamp,
    expiracao datetime not null,
    consumido boolean not null default false,
    ip_solicitante varchar(45) default null,
    usuario_agente varchar(255) default null,

foreign key (id_user) references user(id_user),
unique key ux_token_hash (token_hash),
index idx_user_active (id_user, consumido, expiracao)
);

delimiter $$ 

CREATE PROCEDURE request_reset_token(
    IN p_email VARCHAR(150),
    IN p_ip VARCHAR(45),
    IN p_ua VARCHAR(255),
    IN p_validade_min INT,
    OUT p_token_raw VARCHAR(128),
    OUT p_msg VARCHAR(255)
)
BEGIN
    DECLARE v_id INT;
    DECLARE v_token_raw VARCHAR(128);
    DECLARE v_token_hash VARCHAR(64);
    DECLARE v_expiracao DATETIME;

    SET p_token_raw = NULL;
    SET p_msg = NULL;

    SELECT id_user INTO v_id
    FROM usuario
    WHERE email_user = p_email
    LIMIT 1;

    IF v_id IS NULL THEN
        SET p_msg = 'Usuário não encontrado.';
        RETURN;
    END IF;

    SET v_token_raw = UUID();

    SET v_token_hash = SHA2(v_token_raw, 256);

    SET v_expiracao = DATE_ADD(NOW(), INTERVAL p_validade_min MINUTE);

    SET p_token_raw = v_token_raw;
    SET p_msg = 'Token gerado com sucesso.';

END;
DELIMITER ;INSERT INTO Livro (nome, descricao, id_autor, id_categoria) VALUES ('O Senhor dos Anéis', 'Uma obra épica de fantasia, ambientada na Terra-média, onde a luta entre o bem e o mal atinge seu ápice.',1,2), ('1984', 'Um romance distópico que descreve uma sociedade totalitária onde o governo controla todos os aspectos da vida humana.',2,4)

ALTER TABLE User
ADD COLUMN profilePic LONGTEXT NULL AFTER senha,
ADD COLUMN darkmode VARCHAR(5) NOT NULL DEFAULT 'off' AFTER profilePic,
ADD COLUMN themeColor VARCHAR(20) NOT NULL DEFAULT 'default' AFTER darkmode;
