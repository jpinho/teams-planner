SELECT 
  t."id" AS "id", 
  t."name" AS "name", 
  t."parentId" AS "parentId",
  t."createdAt" AS "createdAt",
  t."updatedAt" AS "updatedAt",
  t."metadata" AS "metadata",
  json_agg(json_build_object(
    'id', tm."id",
    'name', tm."name",
    'role', tm."role",
    'isActive', tm."isActive",
    'metadata', tm."metadata",
    'createdAt', tm."createdAt",
    'updatedAt', tm."updatedAt"
  )) AS "members"
FROM "Team" t
LEFT JOIN "TeamMember" tm ON t."id" = tm."teamId"
GROUP BY t."id";