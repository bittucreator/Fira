import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdmihwupfbnywsntjoxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbWlod3VwZmJueXdzbnRqb3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTgxMjgsImV4cCI6MjA3MjM3NDEyOH0.2XWjdDb_wyS2xj4LrmPdNayoRnB_HY_uRLMKqt_vozg';

export const supabase = createClient(supabaseUrl, supabaseKey);
