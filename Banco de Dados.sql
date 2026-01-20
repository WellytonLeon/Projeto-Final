create user 'root'@'%' IDENTIFIED by '';
grant ALL PRIVILEGES on projeto_final.* to 'root'@'%';
FLUSH PRIVILEGES;


use projeto_final;
create table user(
    id_user int primary key not null auto_increment,
    nome varchar(100) not null,
    email varchar(100) not null unique,
    senha varchar(255) not null
    
);
alter table user
ADD COLUMN profilePic LONGTEXT null after senha,
ADD COLUMN darkmode varchar(5) not null DEFAULT 'off' after profilePic,
ADD COLUMN themeColor varchar(20) not null DEFAULT 'default' after darkmode;
alter table user 
modify COLUMN profilePic varchar(255) after themeColor;


create table categoria(
    id_categoria int primary key not null auto_increment,
    nome varchar(50) UNIQUE not null
);
create table autor(
    id_autor int primary key not null auto_increment,
    nome varchar(150) not null
);
create table livro (
    id_livro int primary key not null AUTO_inCREMENT,
    nome varchar(150) not null,
    id_categoria int,
    id_autor int,
    id_user int not null,  -- Dono do livro
    descricao text,
    foreign key (id_categoria) references categoria(id_categoria) on delete  set null,
    foreign key (id_autor) references autor(id_autor) on delete  set null,
    foreign key (id_user) references user(id_user) on delete  cascade
);
ALTER TABLE livro ADD COLUMN imagem VARCHAR(255);
alter table livro ADD COLUMN ano_publicacao int;

create table avaliacoes (
    avaliacao_id int AUTO_inCREMENT primary key,
    id_livro int,
    id_user int,
    nota int check (nota between 1 and 5),
    comentario text,
    data_avaliacao timestamp DEFAULT current_timestamp,
    foreign key (id_livro) references livro(id_livro),
    foreign key (id_user) references user(id_user)
);

insert into categoria (nome) values
('Fantasia'),
('Ficção Científica'),
('Terror'),
('Romance'),
('Suspense'),
('Mistério'),
('Ação e Aventura'),
('História'),
('Biografia'),
('Autoajuda'),
('Filosofia'),
('Religião'),
('Psicologia'),
('Negócios'),
('Tecnologia'),
('Educação'),
('Poesia'),
('Drama'),
('Clássicos'),
('Contos');


insert into autor (nome) values
('Gabriel García Márquez'),
('Jane Austen'),
('Franz Kafka'),
('Antoine de Saint-Exupéry'),
('José Saramago'),
('Mary Shelley'),
('Edgar Rice Burroughs'),
('Alexandre Dumas'),
('H. G. Wells'),
('Liev Tolstói'),
('Margaret Atwood'),
('Phillip K. Dick'),
('James Patterson'),
('Suzanne Collins'),
('Rick Riordan'),
('Colleen Hoover'),
('Stephen Hawking'),
('C. S. Lewis'),
('Erin Morgenstern'),
('Khaled Hosseini');

create table logalteracoes (
    log_id int AUTO_inCREMENT primary key,
    tabela_afetada varchar(100),
    operacao varchar(50),  -- 'insert', 'update', 'delete '
    registro_id int,       -- ID do registro alterado
    id_user int,           -- ID do usuário que fez a alteração
    dados_antigos text,    -- Para armazenar dados antigos (no caso de update e delete )
    dados_novos text,      -- Para armazenar dados novos (no caso de insert e update)
    data_alteracao timestamp DEFAULT current_timestamp
);

delimiter $$

create triggerloginsertlivros
after insert on livro
for each row
begin
    declare nomeautor varchar(150);
    declare nomecategoria varchar(50);

    select COALESCE((select nome from autor where id_autor = NEW.id_autor limit 1), '(desconhecido)') into nomeautor;

    select COALESCE((select nome from categoria where id_categoria = NEW.id_categoria limit 1), '(desconhecido)') into nomecategoria;

    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_novos, id_user)
    values(
        'livro', 
        'insert', 
        NEW.id_livro, 
        CONCAT('título: ', NEW.nome, ', autor: ', nomeautor, ', categoria: ', nomecategoria, ', descrição: ', NEW.descricao),
        null
    );
end $$

create triggerlogupdatelivros
after update on livro
for each row
begin
    declare oldautor varchar(150);
    declare oldcategoria varchar(50);
    declare newautor varchar(150);
    declare newcategoria varchar(50);

    select COALESCE((select nome from autor where id_autor = OLD.id_autor limit 1), '(desconhecido)') into oldautor;

    select COALESCE((select nome from categoria where id_categoria = OLD.id_categoria limit 1), '(desconhecido)') into oldcategoria;

    select COALESCE((select nome from autor where id_autor = NEW.id_autor limit 1), '(desconhecido)') into newautor;

    select COALESCE((select nome from categoria where id_categoria = NEW.id_categoria limit 1), '(desconhecido)') into newcategoria;

    insert into logalteracoes 
        (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    values(
        'livro', 
        'update', 
        OLD.id_livro,
        CONCAT('título: ', OLD.nome, ', autor: ', oldautor, ', categoria: ', oldcategoria, ', descrição: ', OLD.descricao),
        CONCAT('título: ', NEW.nome, ', autor: ', newautor, ', categoria: ', newcategoria, ', descrição: ', NEW.descricao),
        null
    );
end $$

create trigger logdelete livros
after delete  on livro
for each row
begin
    declare nomeautor varchar(150);
    declare nomecategoria varchar(50);

    select COALESCE((select nome from autor where id_autor = OLD.id_autor limit 1), '(desconhecido)') into nomeautor;

    select COALESCE((select nome from categoria where id_categoria = OLD.id_categoria limit 1), '(desconhecido)') into nomecategoria;

    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    values(
        'livro', 
        'delete ', 
        OLD.id_livro,
        CONCAT('título: ', OLD.nome, ', autor: ', nomeautor, ', categoria: ', nomecategoria, ', descrição: ', OLD.descricao),
        null,null
    );
end $$

delimiter ; 

delimiter $$
create triggerloginsertusuarios
after insert on user
for each row
begin
    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_novos, id_user)
    values('user', 'insert', NEW.id_user, CONCAT('nome: ', NEW.nome, ', email: ', NEW.email), null);
end $$

create trigger logupdateusuarios
after update on user
for each row
begin
    insert into logalteracoes
        (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    values
        (
            'user',
            'update',
            OLD.id_user,
            CONCAT('nome: ', OLD.nome, ', email: ', OLD.email),
            CONCAT('nome: ', NEW.nome, ', email: ', NEW.email),
            null
        );
end $$

create trigger logdeleteusuarios
after delete  on user
for each row
begin
    insert into logalteracoes
        (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    values
        (
            'user',
            'delete ',
            OLD.id_user,
            CONCAT('nome: ', OLD.nome, ', email: ', OLD.email),
            null,
            null
        );
end $$

delimiter ;

delimiter $$

create trigger loginsertcategoria
after insert on categoria
for each row
begin
    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_novos)
    values('categoria', 'insert', NEW.id_categoria, CONCAT('nome: ', NEW.nome));
end $$

create trigger logupdatecategoria
after update on categoria
for each row
begin
    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos)
    values('categoria', 'update', OLD.id_categoria, CONCAT('nome: ', OLD.nome), CONCAT('nome: ', NEW.nome));
end $$

create trigger logdeletecategoria
after delete  on categoria
for each row
begin
    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_antigos)
    values('categoria', 'delete ', OLD.id_categoria, CONCAT('nome: ', OLD.nome));
end $$

delimiter ;

delimiter $$

create triggerloginsertautor
after insert on autor
for each row
begin
    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_novos)
    values('autor', 'insert', NEW.id_autor, CONCAT('nome: ', NEW.nome));
end $$

create trigger logupdateautor
after update on autor
for each row
begin
    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos)
    values('autor', 'update', OLD.id_autor, CONCAT('nome: ', OLD.nome), CONCAT('nome: ', NEW.nome));
end $$

create trigger logdeleteautor
after delete  on autor
for each row
begin
    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_antigos)
    values('autor', 'delete ', OLD.id_autor, CONCAT('nome: ', OLD.nome));
end $$

delimiter ;

delimiter $$

create trigger loginsertavaliacoes
after insert on avaliacoes
for each row
begin
    declare titulolivro varchar(200);
    declare nomeusuario varchar(100);

    select COALESCE((select nome from livro where id_livro = NEW.id_livro limit 1), '(desconhecido)') into titulolivro;

    select COALESCE((select nome from user where id_user = NEW.id_user limit 1), '(desconhecido)') into nomeusuario;

    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_novos, id_user)
    values(
        'avaliacoes', 'insert', NEW.avaliacao_id, CONCAT('livro: ', IFnull(titulolivro,'(desconhecido)'), 
        ', usuario: ', IFnull(nomeusuario,'(desconhecido)'), ', nota: ', NEW.nota, ', comentario: ', IFnull(NEW.comentario,'')), NEW.id_user
    );
end $$

create trigger logupdateavaliacoes
after update on avaliacoes
for each row
begin
    declare titulolivro varchar(200);
    declare nomeusuario varchar(100);

    select COALESCE((select nome from livro where id_livro = NEW.id_livro limit 1), '(desconhecido)') into titulolivro;

    select COALESCE((select nome from user where id_user = NEW.id_user limit 1), '(desconhecido)') into nomeusuario;

    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_antigos, dados_novos, id_user)
    values(
        'avaliacoes',
        'update',
        OLD.avaliacao_id,
        CONCAT('livro: ', IFnull(titulolivro,'(desconhecido)'), ', usuario: ', IFnull(nomeusuario,'(desconhecido)'), 
        ', nota: ', OLD.nota, ', comentario: ', IFnull(OLD.comentario,'')),
        CONCAT('livro: ', IFnull(titulolivro,'(desconhecido)'), ', usuario: ', IFnull(nomeusuario,'(desconhecido)'), 
        ', nota: ', NEW.nota, ', comentario: ', IFnull(NEW.comentario,'')),
        null
    );
end $$

create trigger logdeleteavaliacoes
after delete  on avaliacoes
for each row
begin
    declare titulolivro varchar(200);
    declare nomeusuario varchar(100);

    select COALESCE((select nome from livro where id_livro = OLD.id_livro limit 1), '(desconhecido)') into titulolivro;

    select COALESCE((select nome from user where id_user = OLD.id_user limit 1), '(desconhecido)') into nomeusuario;

    insert into logalteracoes (tabela_afetada, operacao, registro_id, dados_antigos, id_user)
    values(
        'avaliacoes',
        'delete ',
        OLD.avaliacao_id,
        CONCAT('livro: ', IFnull(titulolivro,'(desconhecido)'), ', usuario: ', IFnull(nomeusuario,'(desconhecido)'), 
        ', nota: ', OLD.nota, ', comentario: ', IFnull(OLD.comentario,'')),
        null,
        null
    );
end $$

delimiter ;


create table sessao (
    id_sessao int primary key auto_increment,
    id_user int not null,
    token varchar(255) not null unique,
    inicio datetime not null DEFAULT CURRENT_TIMESTAMP,
    fim datetime null,
    ativo boolean default true,

    foreign key (id_user) references user(id_user)
);

insert into sessao (id_user, token)
values(1, 'token_exemplo_123');

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

create Procedure request_reset_token(
    in p_email varchar(150),
    in p_ip varchar(45),
    in p_ua varchar(255),
    in p_validade_min inT,
    out p_token_raw varchar(128),
    out p_msg varchar(255)
)
begin
    declare v_id inT;
    declare v_token_raw varchar(128);
    declare v_token_hash varchar(64);
    declare v_expiracao datetime;

    set p_token_raw = null;
    set p_msg = null;

    select id_user into v_id
    from usuario
    where email_user = p_email
    limit 1;

    IF v_id IS null THEN
        set p_msg = 'Usuário não encontrado.';
        RETURN;
    end IF;

    set v_token_raw = UUID();

    set v_token_hash = SHA2(v_token_raw, 256);

    set v_expiracao = DATE_ADD(NOW(), inTERVAL p_validade_min MinUTE);

    set p_token_raw = v_token_raw;
    set p_msg = 'Token gerado com sucesso.';

end;
delimiter ;
