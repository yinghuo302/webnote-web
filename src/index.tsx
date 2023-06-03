/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Routes, Route } from "@solidjs/router"
import './index.css';
import { Modal } from './components/modal';
import { lazy } from 'solid-js';

const EditorPage = lazy(() => import('./pages/editor'))
const Sidebar = lazy(() => import('./components/sidebar'))
const Article = lazy(()=> import('./pages/article'));
const Community = lazy( ()=>import('./pages/community'))
const User = lazy(()=>import('./pages/user'))
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
			<div class='fixed top-0 left-0 flex flex-row w-screen h-screen'>
				<Router>
					<Sidebar></Sidebar>
					<Routes>
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

