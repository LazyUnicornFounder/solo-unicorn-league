
-- Allow admins to upload/update/delete any logo in founder-logos bucket
CREATE POLICY "Admins can upload any logo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'founder-logos' AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update any logo"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'founder-logos' AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete any logo"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'founder-logos' AND public.has_role(auth.uid(), 'admin')
);
