
create domain data."image/webp" as bytea;

CREATE FUNCTION data.upload_media_image(bytea) RETURNS json AS $$
DECLARE
    new_id uuid;
BEGIN
    INSERT INTO data.media (image) VALUES ($1)
    RETURNING id INTO new_id;
    RETURN json_build_object('id', new_id);
END;
$$ LANGUAGE plpgsql;

create or replace function data.get_media_image(id uuid) returns data."image/webp" as $$
  select image from data.media where id = get_media_image.id;
$$ language sql;
