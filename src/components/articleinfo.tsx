import { A } from "@solidjs/router";
import { For } from "solid-js";

export const ArticleInfo = (props: { items: IArticle[] }) => (
  <div class="community-article-list">
    <For each={props.items}>
      {(item) => (
        <article class="community-article">
          <A class="community-article-title" href={`/article/${item.fileId}`}>{item.name}</A>
          <p>{item.description || "暂无简介"}</p>
          <div class="community-article-byline">
            <span>{item.user?.nickname || "Webnote 作者"}</span>
            <span>公开文章</span>
          </div>
        </article>
      )}
    </For>
  </div>
);
