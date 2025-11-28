drop DATABASE projeto_final;
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
create table livro(
    id_livro int primary key not null auto_increment,
    nome varchar(150) not null,
    id_categoria INT,
    id_autor INT,
    descricao text,
    Foreign Key (id_categoria) REFERENCES Categoria(id_categoria),
    Foreign Key (id_autor) REFERENCES Autor(id_autor)
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

INSERT INTO Livro (nome, descricao, id_autor, id_categoria) VALUES
('O Senhor dos Anéis', 'Uma obra épica de fantasia, ambientada na Terra-média, onde a luta entre o bem e o mal atinge seu ápice.',1,2),
('1984', 'Um romance distópico que descreve uma sociedade totalitária onde o governo controla todos os aspectos da vida humana.',2,4);

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
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_novos, id_user)
    VALUES ('Livro', 'INSERT', NEW.id_livro, CONCAT('Título: ', NEW.nome.Livro, ', Autor: ', NEW.nome.Autor, ', Categoria: ', NEW.nome.Categoria, ', Descrição: ', NEW.descricao), NULL);
END $$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER LogUpdateLivros
AFTER UPDATE ON Livro
FOR EACH ROW
BEGIN
    INSERT INTO LogAlteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    VALUES ('Livro', 'UPDATE', OLD.id_livro, 
            CONCAT('Título: ', OLD.nome.Livro, ', Autor: ', OLD.nome.Autor, ', Categoria: ', OLD.nome.Categoria, ', Descrição: ', OLD.descricao), 
            CONCAT('Título: ', NEW.nome.Livro, ', Autor: ', NEW.nome.Autor, ', Categoria: ', NEW.nome.Categoria, ', Descrição: ', NEW.descricao), 
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
            CONCAT('Título: ', OLD.nome.Livro, ', Autor: ', OLD.nome.Autor, ', Categoria: ', OLD.nome.Categoria, ', Descrição: ', OLD.descricao), 
            NULL, NULL);
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

