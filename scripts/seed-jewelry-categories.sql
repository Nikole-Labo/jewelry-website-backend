
MERGE INTO dbo.Categories AS t
USING (
  SELECT * FROM (VALUES
    (N'Rings'),
    (N'Necklaces'),
    (N'Bracelets'),
    (N'Earrings'),
    (N'Brooches'),
    (N'Anklets'),
    (N'Bridal'),
    (N'Chains'),
    (N'Charms'),
    (N'Watches')
  ) AS v(name)
) AS s ON t.name = s.name
WHEN NOT MATCHED THEN
  INSERT (name, description) VALUES (s.name, N'');
