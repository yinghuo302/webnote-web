import { SearchBox } from "../components/search"
import "../assets/css/community.css"
import { ArticleInfo } from "../components/articleinfo"
export  default function Community(){
	return <div class="w-full h-full">
		<header>
			<nav>
				<h1>My Blog</h1>
				<ul>
					<li><a href="#">Home</a></li>
					<li><a href="#">About</a></li>
					<li><a href="#">Contact</a></li>
				</ul>
			</nav>
			<div class="search-container">
				<input type="text" class="search-box" placeholder="Search..."/>
				<button type="submit" class="search-button">Search</button>
			</div>
		</header>
		<ArticleInfo></ArticleInfo>
	</div>
}