create type public.color as enum('red', 'green', 'blue');

alter type public.color owner to postgres;
