module.exports = {
    '/admins/addBook': ['SuperAdmin', 'Bookkeeper'],
    '/admins/editStock' : ['SuperAdmin', 'Bookkeeper'],
    '/admins/deleteBook' : ['SuperAdmin', 'Bookkeeper'],
    '/admins/deleteUser' : ['SuperAdmin', 'Librarian'],
    '/admins/admin' : ['SuperAdmin'],
    '/admins/addAuthor' : ['SuperAdmin', 'Librarian'],
    '/admins/deleteAuthor' : ['SuperAdmin', 'Librarian'],
    '/users/buy' : ['user'],
    '/users/review' : ['user'],
    '/users/add-to-cart' : ['user'],
    '/users/remove-from-cart' : ['user'],
    '/users/cart' :  ['user'],
    '/users/checkout' : ['user'],
    '/users/update-quantity' : ['user'],
    '/login/verify-token' : ['user']
};
