export default function ({ store, redirect }) {
	const auth = store.state.auth
	if (!auth) {
		return redirect('/')
	}
	if (auth.user.account_type.includes('Admin')) {
		return redirect('/Admin/Dashboard')
	}
}
