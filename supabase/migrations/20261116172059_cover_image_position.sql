alter table public.projects
  add column cover_banner_x double precision not null default 50,
  add column cover_banner_y double precision not null default 50,
  add column cover_card_x double precision not null default 50,
  add column cover_card_y double precision not null default 50;

alter table public.projects
  add constraint projects_cover_banner_x_check check (cover_banner_x >= 0 and cover_banner_x <= 100),
  add constraint projects_cover_banner_y_check check (cover_banner_y >= 0 and cover_banner_y <= 100),
  add constraint projects_cover_card_x_check check (cover_card_x >= 0 and cover_card_x <= 100),
  add constraint projects_cover_card_y_check check (cover_card_y >= 0 and cover_card_y <= 100);

comment on column public.projects.cover_banner_x is
  'Horizontal object-position percentage for the full-width banner. 0 is the left edge, 100 is the right edge.';
comment on column public.projects.cover_banner_y is
  'Vertical object-position percentage for the full-width banner. 0 is the top edge, 100 is the bottom edge.';
comment on column public.projects.cover_card_x is
  'Horizontal object-position percentage for the 16:10 card rectangle.';
comment on column public.projects.cover_card_y is
  'Vertical object-position percentage for the 16:10 card rectangle.';

alter table public.blogs
  add column cover_banner_x double precision not null default 50,
  add column cover_banner_y double precision not null default 50,
  add column cover_card_x double precision not null default 50,
  add column cover_card_y double precision not null default 50;

alter table public.blogs
  add constraint blogs_cover_banner_x_check check (cover_banner_x >= 0 and cover_banner_x <= 100),
  add constraint blogs_cover_banner_y_check check (cover_banner_y >= 0 and cover_banner_y <= 100),
  add constraint blogs_cover_card_x_check check (cover_card_x >= 0 and cover_card_x <= 100),
  add constraint blogs_cover_card_y_check check (cover_card_y >= 0 and cover_card_y <= 100);

comment on column public.blogs.cover_banner_x is
  'Horizontal object-position percentage for the full-width banner. 0 is the left edge, 100 is the right edge.';
comment on column public.blogs.cover_banner_y is
  'Vertical object-position percentage for the full-width banner. 0 is the top edge, 100 is the bottom edge.';
comment on column public.blogs.cover_card_x is
  'Horizontal object-position percentage for the 16:10 card rectangle.';
comment on column public.blogs.cover_card_y is
  'Vertical object-position percentage for the 16:10 card rectangle.';
