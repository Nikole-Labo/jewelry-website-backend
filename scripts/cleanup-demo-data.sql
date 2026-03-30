IF OBJECT_ID(N'dbo.Favorites', N'U') IS NOT NULL
BEGIN
  DELETE f
  FROM dbo.Favorites AS f
  INNER JOIN dbo.Products AS p ON p.id = f.product_id
  WHERE LOWER(LTRIM(RTRIM(p.style))) IN (N'punk', N'grunge', N'y2k', N'hippie')
     OR p.name LIKE N'Auto Item%'
     OR p.description = N'Automatically generated item'
     OR p.description = N'Mock data item';
END

DELETE FROM dbo.Products
WHERE LOWER(LTRIM(RTRIM(style))) IN (N'punk', N'grunge', N'y2k', N'hippie')
   OR name LIKE N'Auto Item%'
   OR description = N'Automatically generated item'
   OR description = N'Mock data item';


