create database projeto_final;
use projeto_final;
create table User(
id_user int primary key not null auto_increment,
nome_user varchar(100) not null,
email_user varchar(30) not null unique,
senha_user varchar(50) not null
);
create table categorias(

create table livro(
id_livro int primary key not null auto_increment,
nome_livro varchar(150) not null,
categoria_livro varchar(50),
autor_livro varchar(100),

