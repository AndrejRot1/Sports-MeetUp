# Supabase Setup Instructions

## 1. Ustvarite Supabase projekt

1. Pojdite na [supabase.com](https://supabase.com)
2. Pridružite se ali se prijavite
3. Kliknite "New Project"
4. Izberite organizacijo in vnesite ime projekta
5. Ustvarite geslo za bazo podatkov
6. Izberite regijo in kliknite "Create new project"

## 2. Nastavite okoljske spremenljivke

1. V Supabase dashboardu pojdite na Settings > API
2. Kopirajte "Project URL" in "anon public" ključ
3. V `.env` datoteki zamenjajte vrednosti:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Ustvarite tabelo v bazi podatkov

1. V Supabase dashboardu pojdite na SQL Editor
2. Kopirajte in izvedite SQL kodo iz `supabase-schema.sql`
3. To bo ustvarilo `events` tabelo z ustreznimi pravilniki za varnost

## 4. Omogočite email avtentikacijo

1. V Supabase dashboardu pojdite na Authentication > Settings
2. V "Site URL" vnesite `http://localhost:5173` (za razvoj)
3. V "Redirect URLs" dodajte `http://localhost:5173/auth/callback`
4. Shranite nastavitve

## 5. Začnite z razvojem

```bash
npm run dev
```

## Opombe

- Aplikacija sedaj uporablja Supabase za avtentikacijo in shranjevanje podatkov
- Vsi podatki se shranjujejo v Supabase bazo podatkov
- Row Level Security (RLS) je omogočen za varnost
- Uporabniki lahko vidijo vse dogodke, vendar lahko urejajo/izbrišejo samo svoje 