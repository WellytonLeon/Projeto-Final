create database projeto_final;
use projeto_final;
create table User(
    id_user int primary key not null auto_increment,
    nome_user varchar(100) not null,
    email_user varchar(30) not null unique,
    senha_user varchar(50) not null
);
create table livro(
    id_livro int primary key not null auto_increment,
    nome_livro varchar(150) not null,
    categoria_livro varchar(50),
    autor_livro varchar(100),
    genero varchar(100),
    descricao text
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

INSERT INTO Livro (nome_livro, autor_livro, genero, descricao) VALUES
('O Senhor dos Anéis', 'J.R.R. Tolkien', 'Fantasia', 'Uma obra épica de fantasia, ambientada na Terra-média, onde a luta entre o bem e o mal atinge seu ápice.'),
('1984', 'George Orwell', 'Distopia', 'Um romance distópico que descreve uma sociedade totalitária onde o governo controla todos os aspectos da vida humana.');
INSERT INTO User (nome_user, email_user, senha_user) VALUES
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
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_novos, id_user)
    VALUES ('Livro', 'INSERT', NEW.id_livro, CONCAT('Título: ', NEW.nome_livro, ', Autor: ', NEW.autor_livro, 'Genero: ', NEW.genero, 'Descrição: ', NEW.descricao), NULL);
END $$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER LogUpdateLivros
AFTER UPDATE ON Livro
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    VALUES ('Livro', 'UPDATE', OLD.id_livro, 
            CONCAT('Título: ', OLD.nome_livro, ', Autor: ', OLD.autor_livro, 'Genero: ', OLD.genero, 'Descrição: ', OLD.descricao), 
            CONCAT('Título: ', NEW.nome_livro, ', Autor: ', NEW.autor_livro, 'Genero: ', NEW.genero, 'Descrição: ', NEW.descricao), 
            NULL);  -- Supondo que você não tenha o usuário que fez a alteração, ou pode adicionar logicamente
END $$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER LogDeleteLivros
AFTER DELETE ON Livro
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    VALUES ('Livro', 'DELETE', OLD.id_livro, 
            CONCAT('Título: ', OLD.nome_livro, ', Autor: ', OLD.autor_livro, 'Genero: ', OLD.genero, 'Descrição: ', OLD.descricao), 
            NULL, NULL);
END $$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER LogInsertUsuarios
AFTER INSERT ON User
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_novos, id_user)
    VALUES ('Usuario', 'INSERT', NEW.id_user, CONCAT('Nome: ', NEW.nome_user, ', Email: ', NEW.email_user), NULL);
END $$

DELIMITER ;

