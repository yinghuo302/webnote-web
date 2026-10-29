import { createSignal, Show } from "solid-js";
import { Pagination } from "../components/pagination";
import { ArticleInfo } from "../components/articleinfo";
import { ajax } from "../utils";
import notify from "../components/notify";

export default function Community() {
  const [items, setItems] = createSignal<IArticle[]>([]);
  const [curPage, setCurPage] = createSignal(1);
  const [maxPage, setMaxPage] = createSignal(1);
  const [keyword, setKeyword] = createSignal("");
  const [searched, setSearched] = createSignal(false);

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
      setCurPage(page);
      setMaxPage(Math.max(1, Number(result.pages) || 1));
      setItems(result.articles || []);
      setSearched(true);
    } catch {
      notify("danger", "服务器连接失败");
    }
  }

  return (
    <section class="community-page">
      <header class="community-heading">
        <div>
          <p class="page-kicker">公开内容</p>
          <h1>社区</h1>
          <p class="page-description">阅读他人的记录，也把有价值的想法分享出来。</p>
        </div>
        <span class="community-count">{items().length} 篇</span>
      </header>

      <form class="community-search" onSubmit={(event) => { event.preventDefault(); setCurPage(1); void searchArticle(1); }}>
        <label class="visually-hidden" for="article-search">搜索社区文章</label>
        <input
          id="article-search"
          type="search"
          value={keyword()}
          placeholder="搜索文章"
          onInput={(event) => setKeyword(event.currentTarget.value)}
        />
        <button type="submit">搜索</button>
      </form>

      <div class="community-section-heading">
        <h2>公开文章</h2>
        <span>{keyword() ? `“${keyword()}” 的结果` : "最近分享"}</span>
      </div>
      <Show when={items().length} fallback={
        <div class="community-empty">
          <Show when={searched()} fallback={<span>正在载入社区文章…</span>}>
            <strong>暂时没有文章</strong>
            <span>试试其他关键词，或稍后再来看看。</span>
          </Show>
        </div>
      }>
        <ArticleInfo items={items()} />
      </Show>
      <div class="community-pagination">
        <Pagination curPage={curPage} setCurPage={setCurPage} maxPage={maxPage} onPageChange={(page) => { void searchArticle(page); }} />
      </div>
    </section>
  );
}
