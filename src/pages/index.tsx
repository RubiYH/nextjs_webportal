import styles from "@/styles/Home.module.css";
import { HourglassEmptyOutlined, Search } from "@mui/icons-material";
import { useMemo, useRef, useState } from "react";
import { Alert, AlertColor, Button, Fade, Menu, MenuItem } from "@mui/material";
import { debounce } from "lodash";
import Link from "next/link";
import dayjs from "dayjs";
import { ErrorStatus, handleFetchError } from "./modules/handleFetchError";

export default function Home() {
  const [searchEngineType, setSearchEngineType] = useState<string>("google");

  interface Queries {
    google?: string | null | undefined;
    naver?: string | null | undefined;
  }

  const [currentQuery, setCurrentQuery] = useState<Queries>({ google: null, naver: null });

  interface GoogleSearchResults {
    cacheId?: string;
    displayLink?: string;
    formattedUrl?: string;
    htmlFormattedUrl?: string;
    htmlSnippet?: string;
    htmlTitle?: string;
    kind?: string;
    link?: string;
    pagemap?: any;
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
    const query = e?.target?.value.trim();

    if (query?.length == 0) {
      debouncedSearch.cancel();
      SetIsSearching(false);
      setCurrentQuery({ google: null, naver: null });
      Google_SetSearchResults(undefined);
      Naver_SetSearchResults(undefined);
      setErrorStatus({ status: "error", message: "검색어를 입력하세요." });
      return;
    } else {
      setErrorStatus({ status: null, message: null });
    }

    switch (searchEngineType) {
      default:
      case "google":
        if (query == currentQuery?.google) return;

        if (!isSearching) SetIsSearching(true);
        setCurrentQuery({ ...currentQuery, google: query });
        Google_GetSearchResults(query);
        break;
      case "naver":
        if (query == currentQuery?.naver) return;

        if (!isSearching) SetIsSearching(true);
        setCurrentQuery({ ...currentQuery, naver: query });
        Naver_GetSearchResults(query);
        break;
    }
  };

  // Google
  const Google_GetSearchResults = (query: string | null | undefined) => {
    debouncedSearch(query, "google");
  };

  // Naver
  const Naver_GetSearchResults = (query: string | null | undefined) => {
    debouncedSearch(query, "naver");
  };

  // debouncer
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query, type) => {
        switch (type) {
          default:
          case "google":
            await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/search?engine=google&query=${query}`)
              .then((response: Response) => {
                response.json().then((data) => {
                  handleFetchError(response).then((data) => {
                    setErrorStatus(data);
                    if (data.status == "error") return;
                  });

                  Google_SetSearchResults(data?.data?.items || undefined);
                  SetIsSearching(false);
                  console.log("google");
                });
              })
              .catch((error) => {
                alert(error);
              });
            break;

          case "naver":
            await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/search?engine=naver&query=${query}`)
              .then((response: Response) => {
                response.json().then((data) => {
                  handleFetchError(response).then((data) => {
                    setErrorStatus(data);
                    if (data.status == "error") return;
                  });

                  Naver_SetSearchResults(
                    data?.data?.items?.length > 0 ? data?.data?.items : undefined
                  );
                  SetIsSearching(false);
                  console.log("naver");
                });
              })
              .catch((error) => {
                alert(error);
              });
            break;
        }
      }, 500),
    []
  );

  const onSearchEngineChanged = (engine: string) => {
    if (searchEngineType == engine) return;
    if (!isSearching && (currentQuery?.google || currentQuery?.naver)) SetIsSearching(true);

    switch (engine) {
      default:
      case "google":
        if (!currentQuery?.naver) return;
        if (GoogleSearchResults && currentQuery?.google == currentQuery?.naver)
          return SetIsSearching(false);

        setCurrentQuery({ ...currentQuery, google: currentQuery?.naver });
        Google_GetSearchResults(currentQuery?.naver);
        break;

      case "naver":
        if (!currentQuery?.google) return;
        if (NaverSearchResults && currentQuery?.google == currentQuery?.naver)
          return SetIsSearching(false);

        setCurrentQuery({ ...currentQuery, naver: currentQuery?.google });
        Naver_GetSearchResults(currentQuery?.google);
        break;
    }
  };

  const [isSearching, SetIsSearching] = useState(false);

  const nodeRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const [errorStatus, setErrorStatus] = useState<ErrorStatus>({ status: null, message: null });

  return (
    <div className={styles.main}>
      <section className={styles.container}>
        <span>Next.js Web Portal Test</span>
        <section className={styles.errorSection}>
          {errorStatus?.status && (
            <Alert
              severity={errorStatus?.status}
              sx={{
                borderRadius: "var(--searchInputRadius)",
                padding: "6px",
                alignItems: "center",
                marginBottom: "0.5rem",
                "& .MuiAlert-icon": {
                  padding: 0,
                },
                "& .MuiAlert-message": {
                  padding: 0,
                },
              }}
            >
              {errorStatus?.message}
            </Alert>
          )}
        </section>
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
                  onSearchEngineChanged("google");
                }}
              >
                구글
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setSearchEngineType("naver");
                  onSearchEngineChanged("naver");
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
          <Fade
            in={true}
            timeout={200}
            onTransitionEnd={() => {
              if (currentQuery?.google == null && currentQuery?.naver == null) {
                Google_SetSearchResults(undefined);
                Naver_SetSearchResults(undefined);
              }
            }}
          >
            <div
              className={`${styles.search_lists} customScrollbar`}
              tabIndex={0}
              style={
                (searchEngineType == "google" &&
                  currentQuery?.google &&
                  currentQuery?.google?.length > 0) ||
                (searchEngineType == "naver" &&
                  currentQuery?.naver &&
                  currentQuery?.naver?.length > 0)
                  ? {
                      height:
                        (searchEngineType == "google" && GoogleSearchResults) ||
                        (searchEngineType == "naver" && NaverSearchResults) ||
                        (!isSearching &&
                          ((searchEngineType == "google" && GoogleSearchResults == undefined) ||
                            (searchEngineType == "naver" && NaverSearchResults == undefined)))
                          ? "calc(100vh * 0.5)"
                          : undefined,
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
                      <Link href={{ pathname: s?.formattedUrl || s?.htmlFormattedUrl }}>
                        <div>
                          <section>
                            <span id="title_f">
                              {(s?.pagemap?.cse_thumbnail?.[0]?.src ||
                                s?.pagemap?.cse_image?.[0]?.src) && (
                                <img
                                  id="thumbnail"
                                  src={
                                    s?.pagemap?.cse_thumbnail?.[0]?.src ||
                                    s?.pagemap?.cse_image?.[0]?.src
                                  }
                                  alt=""
                                  style={{ objectFit: "scale-down", width: "2rem", height: "2rem" }}
                                />
                              )}
                              <span
                                id="title"
                                dangerouslySetInnerHTML={{
                                  __html: s?.htmlTitle || s?.htmlTitle || "",
                                }}
                              ></span>
                            </span>
                            <span
                              id="description"
                              dangerouslySetInnerHTML={{
                                __html: s?.htmlSnippet || s?.snippet || "",
                              }}
                              style={{
                                height: s?.htmlSnippet || s?.snippet ? undefined : "2rem",
                              }}
                            ></span>
                          </section>
                        </div>
                      </Link>
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
                            <section>
                              <span
                                id="title"
                                dangerouslySetInnerHTML={{ __html: s?.title || "" }}
                              ></span>
                              <br />
                              <span
                                id="description"
                                dangerouslySetInnerHTML={{ __html: s?.description || "" }}
                                style={{
                                  height: s?.description ? undefined : "2rem",
                                }}
                              ></span>
                              <span id="postdate">
                                {s?.postdate ? dayjs(s?.postdate).format("YYYY / MM / DD") : ""}
                              </span>
                            </section>
                          </div>
                        </Link>
                      </section>
                    </Fade>
                  ))}
                  <br />
                </>
              )}
              {!isSearching &&
                ((searchEngineType == "google" && GoogleSearchResults == undefined) ||
                  (searchEngineType == "naver" && NaverSearchResults == undefined)) && (
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
