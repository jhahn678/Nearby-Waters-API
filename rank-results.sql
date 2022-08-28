
-- Function for ranking results by distance and weight --

CREATE OR REPLACE FUNCTION 
	rank_result(
		distance double precision, 
		weight real,
		maxDistance integer default 300000, 
		minDistance integer default 15000, 
		maxWeight real default 2, 
		minWeight real default 1.3
	) 
RETURNS double precision
 RETURNS NULL ON NULL INPUT
language plpgsql
as $$
begin
	if distance < minDistance then
		return (maxWeight - ( POWER((minDistance/maxDistance), 2) * (maxWeight - minWeight) )) * weight;
	else
		return (maxWeight - ( POWER((distance/maxDistance), 2) * (maxWeight - minWeight) )) * weight;
	end if;
end;
$$;