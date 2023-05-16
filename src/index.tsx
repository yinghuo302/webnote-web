/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Routes, Route } from "@solidjs/router"
import './index.css';
import Login from './components/login';
import EditorPage from './pages/editor';
import Sidebar from './components/sidebar';
import { Article } from './pages/article';
import Community from './pages/community';
import User from './pages/user';
import { Modal } from './components/modal';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
	);
}

render(
	() => (
		<>
			<Modal></Modal>
			<div class='flex flex-row w-screen h-screen'>
				<Router>
					<Sidebar></Sidebar>
					<Routes>
						<Route path="/login" component={Login} />
						<Route path="/" component={EditorPage} />
						<Route path="/user" component={User} />
						<Route path="/editor" component={EditorPage} />
						<Route path="/article/:id" component={Article} />
						<Route path="/community" component={Community} />
					</Routes>
				</Router>
			</div>
		</>
	),
	root!
);

