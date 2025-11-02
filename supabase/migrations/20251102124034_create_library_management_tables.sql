/*
  # Library Management System Schema

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `title` (text, book title)
      - `author` (text, author name)
      - `isbn` (text, unique identifier)
      - `category` (text, book category/genre)
      - `total_copies` (integer, total number of copies)
      - `available_copies` (integer, currently available copies)
      - `publication_year` (integer, year published)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `members`
      - `id` (uuid, primary key)
      - `name` (text, member name)
      - `email` (text, unique email)
      - `phone` (text, contact number)
      - `membership_date` (date, when they joined)
      - `status` (text, active/inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `borrowing_records`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key to books)
      - `member_id` (uuid, foreign key to members)
      - `borrow_date` (date, when book was borrowed)
      - `due_date` (date, when book should be returned)
      - `return_date` (date, nullable, when book was actually returned)
      - `status` (text, borrowed/returned/overdue)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since no auth is required)
    
  3. Important Notes
    - All tables have timestamps for audit purposes
    - Books track both total and available copies
    - Borrowing records maintain complete history
    - Foreign keys ensure data integrity
*/

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE NOT NULL,
  category text NOT NULL,
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  publication_year integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  membership_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS borrowing_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  borrow_date date DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  return_date date,
  status text DEFAULT 'borrowed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowing_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for books"
  ON books FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public insert access for books"
  ON books FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public update access for books"
  ON books FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for books"
  ON books FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Public read access for members"
  ON members FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public insert access for members"
  ON members FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public update access for members"
  ON members FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for members"
  ON members FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Public read access for borrowing_records"
  ON borrowing_records FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public insert access for borrowing_records"
  ON borrowing_records FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public update access for borrowing_records"
  ON borrowing_records FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for borrowing_records"
  ON borrowing_records FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_borrowing_records_status ON borrowing_records(status);
CREATE INDEX IF NOT EXISTS idx_borrowing_records_book_id ON borrowing_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_records_member_id ON borrowing_records(member_id);