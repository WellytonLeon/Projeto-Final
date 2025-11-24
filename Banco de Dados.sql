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
('O Senhor dos Anéis', 'J.R.R. Tolkien', 1954, 'Fantasia', 'Uma obra épica de fantasia, ambientada na Terra-média, onde a luta entre o bem e o mal atinge seu ápice.'),
('1984', 'George Orwell', 1949, 'Distopia', 'Um romance distópico que descreve uma sociedade totalitária onde o governo controla todos os aspectos da vida humana.');
INSERT INTO User (nome_user, email_user, senha_user) VALUES
('João Silva', 'joao@exemplo.com', 'senha123'),
('Maria Oliveira', 'maria@exemplo.com', 'senha456');
INSERT INTO Avaliacoes (id_livro, id_user, nota, comentario) VALUES
(1, 1, 5, 'Excelente livro, com uma narrativa envolvente e personagens cativantes!'),
(2, 2, 4, 'Uma crítica interessante ao totalitarismo, mas achei o ritmo um pouco lento em algumas partes.');