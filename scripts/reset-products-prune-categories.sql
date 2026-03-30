
IF OBJECT_ID(N'dbo.Favorites', N'U') IS NOT NULL
  DELETE FROM dbo.Favorites;

DELETE FROM dbo.Products;

DECLARE @Keep TABLE (name_norm NVARCHAR(200) PRIMARY KEY);

INSERT INTO @Keep (name_norm) VALUES
  (N'rings'),
  (N'necklaces'),
  (N'bracelets'),
  (N'earrings'),
  (N'brooches'),
  (N'anklets'),
  (N'bridal'),
  (N'chains'),
  (N'charms'),
  (N'watches'),
  (N'pendants'),
  (N'ring'),
  (N'necklace'),
  (N'bracelet'),
  (N'earring'),
  (N'jewelry sets'),
  (N'sets'),
  (N'piercing'),
  (N'body chain'),
  (N'body chains'),
  (N'anklet'),
  (N'brooch'),
  (N'charm'),
  (N'watch'),
  (N'fine gold'),
  (N'sterling silver'),
  (N'rose gold'),
  (N'platinum'),
  (N'pearl'),
  (N'gemstone'),
  (N'vintage-inspired'),
  (N'minimalist'),
  (N'bridal'),
  (N'statement'),
  (N'everyday');

DELETE FROM c
FROM dbo.Categories AS c
WHERE LOWER(LTRIM(RTRIM(c.name))) NOT IN (SELECT name_norm FROM @Keep);
