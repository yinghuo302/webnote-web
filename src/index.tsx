/* @refresh reload */
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Route, Router, Routes } from "@solidjs/router";
import "./index.css";
import "@muyajs/core/lib/core.css";
import AppHeader from "./components/app-header";
import { Modal } from "./components/modal";

const EditorPage = lazy(() => import("./pages/editor"));
const Article = lazy(() => import("./pages/article"));
const Community = lazy(() => import("./pages/community"));
const User = lazy(() => import("./pages/user"));
const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found. Add an element with id=\"root\" to index.html.");
}

window.addEventListener("dragover", (event) => event.preventDefault());
window.addEventListener("drop", (event) => event.preventDefault());

render(
  () => (
    <Router>
      <Modal />
      <div class="app-frame">
        <AppHeader />
        <main class="app-route-view">
          <Routes>
            <Route path="/" component={EditorPage} />
            <Route path="/editor" component={EditorPage} />
            <Route path="/community" component={Community} />
            <Route path="/user" component={User} />
            <Route path="/article/:id" component={Article} />
          </Routes>
        </main>
      </div>
    </Router>
  ),
  root!,
);
