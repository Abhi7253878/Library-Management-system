import { useState, useEffect } from 'react';
import { supabase, Book, Member, BorrowingRecord } from '../lib/supabase';
import { BookCopy, ArrowLeftRight, CheckCircle } from 'lucide-react';

type BorrowingRecordWithDetails = BorrowingRecord & {
  books?: Book;
  members?: Member;
};

export default function BorrowingSystem() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [borrowingRecords, setBorrowingRecords] = useState<BorrowingRecordWithDetails[]>([]);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [formData, setFormData] = useState({
    book_id: '',
    member_id: '',
    due_date: '',
  });

  useEffect(() => {
    fetchBooks();
    fetchMembers();
    fetchBorrowingRecords();
  }, []);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .gt('available_copies', 0)
      .order('title', { ascending: true });

    if (error) {
      alert('Error fetching books: ' + error.message);
    } else {
      setBooks(data || []);
    }
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) {
      alert('Error fetching members: ' + error.message);
    } else {
      setMembers(data || []);
    }
  };

  const fetchBorrowingRecords = async () => {
    const { data, error } = await supabase
      .from('borrowing_records')
      .select(
        `
        *,
        books (*),
        members (*)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      alert('Error fetching borrowing records: ' + error.message);
    } else {
      setBorrowingRecords(data || []);
    }
  };

  const handleBorrowBook = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('borrowing_records').insert([
      {
        book_id: formData.book_id,
        member_id: formData.member_id,
        due_date: formData.due_date,
        status: 'borrowed',
      },
    ]);

    if (error) {
      alert('Error borrowing book: ' + error.message);
      return;
    }

    const book = books.find((b) => b.id === formData.book_id);
    if (book) {
      const { error: updateError } = await supabase
        .from('books')
        .update({
          available_copies: book.available_copies - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', formData.book_id);

      if (updateError) {
        alert('Error updating book availability: ' + updateError.message);
      }
    }

    fetchBooks();
    fetchBorrowingRecords();
    resetForm();
  };

  const handleReturnBook = async (record: BorrowingRecordWithDetails) => {
    if (!confirm('Confirm book return?')) return;

    const { error } = await supabase
      .from('borrowing_records')
      .update({
        return_date: new Date().toISOString().split('T')[0],
        status: 'returned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id);

    if (error) {
      alert('Error returning book: ' + error.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('books')
      .update({
        available_copies: supabase.rpc('increment', { row_id: record.book_id }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.book_id);

    if (updateError) {
      const book = books.find((b) => b.id === record.book_id);
      if (book) {
        await supabase
          .from('books')
          .update({
            available_copies: book.available_copies + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.book_id);
      }
    }

    fetchBooks();
    fetchBorrowingRecords();
  };

  const resetForm = () => {
    setFormData({
      book_id: '',
      member_id: '',
      due_date: '',
    });
    setShowBorrowForm(false);
  };

  const getMinDueDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const isOverdue = (dueDate: string, returnDate: string | null) => {
    if (returnDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-800">Borrowing System</h2>
        </div>
        <button
          onClick={() => setShowBorrowForm(!showBorrowForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <BookCopy className="w-5 h-5" />
          Borrow Book
        </button>
      </div>

      {showBorrowForm && (
        <form onSubmit={handleBorrowBook} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Borrow a Book</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={formData.book_id}
              onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.author} (Available: {book.available_copies})
                </option>
              ))}
            </select>

            <select
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.email}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              min={getMinDueDate()}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Borrow Book
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrow Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {borrowingRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.books?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.members?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(record.borrow_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(record.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.return_date
                      ? new Date(record.return_date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'returned'
                          ? 'bg-green-100 text-green-800'
                          : isOverdue(record.due_date, record.return_date)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {record.status === 'returned'
                        ? 'Returned'
                        : isOverdue(record.due_date, record.return_date)
                        ? 'Overdue'
                        : 'Borrowed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.status === 'borrowed' && (
                      <button
                        onClick={() => handleReturnBook(record)}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {borrowingRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">No borrowing records found</div>
          )}
        </div>
      </div>
    </div>
  );
}
