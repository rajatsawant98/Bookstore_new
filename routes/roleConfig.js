module.exports = {
    '/admins/addBook': ['SuperAdmin', 'Bookkeeper'],
    '/admins/editStock' : ['SuperAdmin', 'Bookkeeper'],
    '/admins/deleteBook' : ['SuperAdmin', 'Bookkeeper'],
    '/admins/deleteUser' : ['SuperAdmin', 'Librarian'],
    '/admins/admin' : ['SuperAdmin'],
    '/admins/addAuthor' : ['SuperAdmin', 'Librarian'],
    '/admins/deleteAuthor' : ['SuperAdmin', 'Librarian']
};
