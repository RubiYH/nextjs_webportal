import styles from "@/styles/Home.module.css";
import { Google, Search } from "@mui/icons-material";
import { useMemo, useRef, useState } from "react";
import { Button, Fade, IconButton, Menu, MenuItem } from "@mui/material";
import { debounce } from "lodash";

export default function Home() {
  const [searchEngineType, setSearchEngineType] = useState<String>("google");
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState(String || null);

  interface GoogleSearchResults {
    cacheId?: String;
    displayLink?: String;
    formattedUrl?: String;
    htmlFormattedUrl?: String;
    htmlSnippet?: String;
    htmlTitle?: String;
    kind?: String;
    link?: String;
    pagemap?: Object;
    snippet?: String;
    title?: String;
  }

  interface NaverSearchResults {
    bloggerlink?: String;
    bloggername?: String;
    description?: String;
    link?: String;
    postdate?: String;
    title?: String;
  }

  const [GoogleSearchResults, Google_SetSearchResults] = useState<GoogleSearchResults[]>();

  const [NaverSearchResults, Naver_SetSearchResults] = useState<NaverSearchResults[]>();

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim();

    setSearchQuery(query);

    if (!query || query.length < 1) {
      Google_SetSearchResults(undefined);
      Naver_SetSearchResults(undefined);
      debouncedSearch.cancel();
      return;
    }

    switch (searchEngineType) {
      default:
      case "google":
        Google_GetSearchResults(query);
        break;
      case "naver":
        Naver_GetSearchResults(query);
        break;
    }
  };

  // Google
  const Google_GetSearchResults = (query: String) => {
    console.log("google");

    debouncedSearch(query, "google");
  };

  // Naver
  const Naver_GetSearchResults = (query: String) => {
    console.log("naver");

    debouncedSearch(query, "naver");
  };

  // debouncer
  const debouncedSearch = useMemo(
    () =>
      debounce((query, type) => {
        switch (type) {
          default:
          case "google":
            fetch(`http://localhost:3000/api/search?engine=google&query=${query}`).then(
              (response: Response) => {
                response.json().then((data) => {
                  Google_SetSearchResults(data?.data?.items || undefined);
                });
              }
            );
            break;
          case "naver":
            fetch(`http://localhost:3000/api/search?engine=naver&query=${query}`).then(
              (response: Response) => {
                response.json().then((data) => {
                  Naver_SetSearchResults(data?.data?.items || undefined);
                });
              }
            );
            break;
        }
      }, 500),
    []
  );

  const nodeRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  return (
    <div className={styles.main}>
      <section className={styles.container}>
        <span>Welcome</span>
        <div className={styles.search_bar}>
          <div className={styles.search_engine}>
            {searchQuery.length < 1 && (
              <Button
                onClick={handleClick}
                sx={{ borderRadius: "var(--searchInputRadius)", padding: "0.5rem" }}
                disableTouchRipple={true}
              >
                엔진
              </Button>
            )}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setSearchEngineType("google");
                }}
              >
                구글
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setSearchEngineType("naver");
                }}
              >
                네이버
              </MenuItem>
            </Menu>
          </div>
          <input
            className={styles.search_input}
            tabIndex={0}
            placeholder="검색"
            onFocus={() => {
              setIsSearchBarFocused(true);
            }}
            onBlur={(e) => {
              if (e.relatedTarget?.className == styles.search_lists) return;
              setIsSearchBarFocused(false);
            }}
            onChange={onSearchInputChange}
            style={{
              borderBottomLeftRadius:
                isSearchBarFocused && (GoogleSearchResults || NaverSearchResults) ? 0 : undefined,
              borderBottomRightRadius:
                isSearchBarFocused && (GoogleSearchResults || NaverSearchResults) ? 0 : undefined,
            }}
            autoComplete="off"
          />
          <div className={styles.search_icon}>
            <Search color="action" />
          </div>
          <Fade in={isSearchBarFocused} timeout={500}>
            <div
              className={styles.search_lists}
              tabIndex={0}
              onBlur={(e) => {
                if (e.relatedTarget?.className == styles.search_input) return;
                setIsSearchBarFocused(false);
              }}
              style={{
                height:
                  isSearchBarFocused && (GoogleSearchResults || NaverSearchResults)
                    ? "calc(100vh * 0.5)"
                    : 0,
              }}
            >
              {searchEngineType == "google" &&
                GoogleSearchResults &&
                GoogleSearchResults.map((s, i) => (
                  <Fade in={true} ref={nodeRef} key={i} timeout={500}>
                    <span>{s?.title}</span>
                  </Fade>
                ))}
              {searchEngineType == "naver" &&
                NaverSearchResults &&
                NaverSearchResults.map((s, i) => (
                  <Fade in={true} ref={nodeRef} key={i} timeout={500}>
                    <span dangerouslySetInnerHTML={{ __html: s?.title || "" }}></span>
                  </Fade>
                ))}
            </div>
          </Fade>
        </div>
      </section>
    </div>
  );
}
