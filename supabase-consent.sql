-- Consent flag on join table
ALTER TABLE public.event_participants
ADD COLUMN IF NOT EXISTS share_with_host boolean DEFAULT false;

-- RPC: organizer-only view of participants (gender + age band only if consented)
CREATE OR REPLACE FUNCTION public.get_event_participants_for_host(p_event_id uuid)
RETURNS TABLE (
  user_id uuid,
  gender text,
  age_band text,
  joined_at timestamptz
) AS $$
BEGIN
  -- ensure caller is the event organizer
  IF NOT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event_id AND e.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    ep.user_id,
    CASE WHEN ep.share_with_host THEN pr.gender ELSE NULL END AS gender,
    CASE
      WHEN ep.share_with_host THEN
        CASE
          WHEN pr.age IS NULL THEN NULL
          WHEN pr.age BETWEEN 13 AND 17 THEN '13-17'
          WHEN pr.age BETWEEN 18 AND 24 THEN '18-24'
          WHEN pr.age BETWEEN 25 AND 34 THEN '25-34'
          WHEN pr.age BETWEEN 35 AND 44 THEN '35-44'
          WHEN pr.age BETWEEN 45 AND 54 THEN '45-54'
          WHEN pr.age >= 55 THEN '55+'
          ELSE NULL
        END
      ELSE NULL
    END AS age_band,
    ep.joined_at
  FROM public.event_participants ep
  JOIN public.profiles pr ON pr.id = ep.user_id
  WHERE ep.event_id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.get_event_participants_for_host(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_participants_for_host(uuid) TO authenticated; 