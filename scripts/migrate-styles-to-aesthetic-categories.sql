
MERGE INTO dbo.Categories AS t
USING (
  SELECT * FROM (VALUES
    (N'Fine gold'),
    (N'Sterling silver'),
    (N'Rose gold'),
    (N'Platinum'),
    (N'Pearl'),
    (N'Gemstone'),
    (N'Vintage-inspired'),
    (N'Minimalist'),
    (N'Bridal'),
    (N'Statement'),
    (N'Everyday')
  ) AS v(name)
) AS s ON LOWER(LTRIM(RTRIM(t.name))) = LOWER(LTRIM(RTRIM(s.name)))
WHEN NOT MATCHED THEN
  INSERT (name, description) VALUES (s.name, N'');

UPDATE p
SET p.category_id = c.id
FROM dbo.Products AS p
INNER JOIN dbo.Categories AS c
  ON LOWER(LTRIM(RTRIM(c.name))) = LOWER(LTRIM(RTRIM(p.style)))
WHERE LOWER(LTRIM(RTRIM(p.style))) IN (
  N'fine gold',
  N'sterling silver',
  N'rose gold',
  N'platinum',
  N'pearl',
  N'gemstone',
  N'vintage-inspired',
  N'minimalist',
  N'bridal',
  N'statement',
  N'everyday'
);

UPDATE dbo.Products
SET style = N'Classy'
WHERE LOWER(LTRIM(RTRIM(style))) IN (
  N'fine gold',
  N'sterling silver',
  N'rose gold',
  N'platinum',
  N'pearl',
  N'gemstone',
  N'vintage-inspired',
  N'minimalist',
  N'bridal',
  N'statement',
  N'everyday'
);
