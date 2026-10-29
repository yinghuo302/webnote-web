import { createSignal } from "solid-js";
import { Pagination } from "../components/pagination";
import { ArticleInfo } from "../components/articleinfo";
import { ajax } from "../utils";
import notify from "../components/notify";

export default function Community() {
  const [items, setItems] = createSignal<IArticle[]>([]);
  const [curPage, setCurPage] = createSignal(1);
  const [maxPage, setMaxPage] = createSignal(1);
  const [keyword, setKeyword] = createSignal("");

  async function searchArticle(page = 1) {
    try {
      const result = await ajax.ajax({
        type: "GET",
        url: "/api/public/articles",
        data: { keywd: keyword(), page },
      });
      if (result?.status !== "success") {
        notify("warning", "文章列表获取失败");
        return;
      }
      setMaxPage(Math.max(1, Number(result.pages) || 1));
      setItems(result.articles || []);
    } catch {
      notify("danger", "服务器连接失败");
    }
  }

  return (
    <section class="community-page">
      <div class="community-hero">
        <span class="sidebar-eyebrow">COMMUNITY</span>
        <h1>灵感社区</h1>
        <p>浏览、搜索并分享值得记录的想法。</p>
      </div>
      <form class="community-search" onSubmit={(event) => { event.preventDefault(); setCurPage(1); void searchArticle(1); }}>
        <input
          type="search"
          value={keyword()}
          placeholder="搜索文章标题或内容"
          onInput={(event) => setKeyword(event.currentTarget.value)}
        />
        <button type="submit">搜索</button>
      </form>
      <div class="community-results"><ArticleInfo items={items()} /></div>
      <div class="community-pagination">
        <Pagination curPage={curPage} setCurPage={setCurPage} maxPage={maxPage} onPageChange={(page) => { void searchArticle(page); }} />
      </div>
    </section>
  );
}
