create table technologies (
    id serial primary key,
    nome varchar(100) not null
);

create table profiles (
    id serial primary key,
    nome varchar(100) not null,
    email varchar(150) not null,
    bio text,
    github varchar(200)
);

create table projects (
    id serial primary key,
    nome varchar(150) not null,
    descricao text,
    link_repositorio varchar(300),
    link_demo varchar(300),
    curtidas integer default 0,
    nota_media decimal(2,1) default 0,
    profile_id integer references profiles(id)
);

create table feedbacks(
    id serial primary key,
    nota integer not null check (nota >=1 and nota <=5),
    comentario text,
    project_id integer references projects(id)
);

create table project_technologies (
    project_id integer references projects(id),
    technology_id integer references technologies(id),
    primary key (project_id, technology_id)
);
