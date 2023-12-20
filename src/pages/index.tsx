import styles from "@/styles/Home.module.css";
import { HourglassEmptyOutlined, Search } from "@mui/icons-material";
import { useMemo, useRef, useState } from "react";
import { Button, Fade, IconButton, Menu, MenuItem } from "@mui/material";
import { debounce } from "lodash";
import Link from "next/link";
import dayjs from "dayjs";

export default function Home() {
  const [searchEngineType, setSearchEngineType] = useState<String>("google");
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState(String || null);

  interface GoogleSearchResults {
    cacheId?: string;
    displayLink?: string;
    formattedUrl?: string;
    htmlFormattedUrl?: string;
    htmlSnippet?: string;
    htmlTitle?: string;
    kind?: string;
    link?: string;
    pagemap?: Object;
    snippet?: string;
    title?: string;
    error?: Object;
  }

  interface NaverSearchResults {
    bloggerlink?: string;
    bloggername?: string;
    description?: string;
    link?: string;
    postdate?: string;
    title?: string;
  }

  const [GoogleSearchResults, Google_SetSearchResults] = useState<
    GoogleSearchResults[] | undefined
  >();

  const [NaverSearchResults, Naver_SetSearchResults] = useState<NaverSearchResults[] | undefined>();

  const onSearchInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEventHandler<HTMLInputElement>
  ) => {
    if (!isSearching) SetIsSearching(true);
    const query = e?.target?.value.trim();

    setSearchQuery(query);

    if (!query || query.length < 1) {
      Google_SetSearchResults(undefined);
      Naver_SetSearchResults(undefined);
      debouncedSearch.cancel();
      SetIsSearching(false);

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
    debouncedSearch(query, "google");
  };

  // Naver
  const Naver_GetSearchResults = (query: String) => {
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
                  SetIsSearching(false);
                  console.log("google");
                });
              }
            );
            break;
          case "naver":
            fetch(`http://localhost:3000/api/search?engine=naver&query=${query}`).then(
              (response: Response) => {
                response.json().then((data) => {
                  Naver_SetSearchResults(
                    data?.data?.items?.length > 0 ? data?.data?.items : undefined
                  );
                  console.log("naver");
                  SetIsSearching(false);
                });
              }
            );
            break;
        }
      }, 500),
    []
  );

  const [isSearching, SetIsSearching] = useState(false);

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
            <Button
              onClick={handleClick}
              sx={{ borderRadius: "var(--searchInputRadius)", padding: "0.5rem" }}
              disableTouchRipple={true}
              id="searchEngineBtn"
            >
              {searchEngineType == "naver" ? (
                <span style={{ color: "var(--naver-color)" }}>네이버</span>
              ) : (
                <span style={{ color: "var(--google-color)" }}>구글</span>
              )}
            </Button>

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
              if (e.relatedTarget?.className.includes(styles.search_lists)) return;
              setIsSearchBarFocused(false);
            }}
            onChange={onSearchInputChange}
            onKeyDown={onSearchInputChange}
            style={{
              border:
                searchEngineType == "naver"
                  ? "2px solid var(--naver-color)"
                  : "2px solid var(--google-color)",
            }}
            autoComplete="off"
          />

          <div className={styles.search_icon}>
            {!isSearching ? <Search color="action" /> : <HourglassEmptyOutlined color="action" />}
          </div>
          <Fade in={isSearchBarFocused} timeout={200}>
            <div
              className={`${styles.search_lists} customScrollbar`}
              tabIndex={0}
              onBlur={(e) => {
                if (e.relatedTarget?.className == (styles.search_input || styles.search_lists))
                  return;
                setIsSearchBarFocused(false);
              }}
              style={
                isSearchBarFocused && searchQuery
                  ? {
                      height: !isSearching ? "calc(100vh * 0.5)" : undefined,
                      border:
                        !GoogleSearchResults && !NaverSearchResults && !isSearching
                          ? "2.5px solid rgba(0,0,0,0.2)"
                          : "0px solid #fff",
                    }
                  : { border: "0px solid #fff" }
              }
            >
              {searchEngineType == "google" &&
                GoogleSearchResults &&
                GoogleSearchResults.map((s, i) => (
                  <Fade in={true} ref={nodeRef} key={i} timeout={500}>
                    <section className={styles.GoogleSearchResultsCard}>
                      <span>{s?.title}</span>
                    </section>
                  </Fade>
                ))}
              {searchEngineType == "naver" && NaverSearchResults && (
                <>
                  {NaverSearchResults.map((s, i) => (
                    <Fade in={true} ref={nodeRef} key={i} timeout={500}>
                      <section className={styles.NaverSearchResultsCard}>
                        <Link href={{ pathname: s?.link }}>
                          <div>
                            <span
                              id="title"
                              dangerouslySetInnerHTML={{ __html: s?.title || "" }}
                            ></span>
                            <br />
                            <span
                              id="description"
                              dangerouslySetInnerHTML={{ __html: s?.description || "" }}
                              style={{
                                fontSize: "0.85rem",
                                height: s?.description ? undefined : "2rem",
                              }}
                            ></span>
                            <span id="postdate">
                              {s?.postdate ? dayjs(s?.postdate).format("YYYY / MM / DD") : ""}
                            </span>
                          </div>
                        </Link>
                      </section>
                    </Fade>
                  ))}
                  <br />
                </>
              )}
              {!isSearching &&
                GoogleSearchResults == undefined &&
                NaverSearchResults == undefined && (
                  <section className={styles.noSearchResults}>
                    <span>검색 결과가 없습니다.</span>
                    <span
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => {
                        console.log("d");
                        setAnchorEl(document.getElementById("searchEngineBtn"));
                      }}
                    >
                      다른 검색 엔진을 사용해보세요.
                    </span>
                  </section>
                )}
            </div>
          </Fade>
        </div>
      </section>
    </div>
  );
}
