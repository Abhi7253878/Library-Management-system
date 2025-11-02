import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  total_copies: number;
  available_copies: number;
  publication_year: number | null;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  membership_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type BorrowingRecord = {
  id: string;
  book_id: string;
  member_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};
