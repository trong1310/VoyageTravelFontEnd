import { RiCloseFill, RiCloseLine, RiTimeLine } from "react-icons/ri";
import { getItemStorage, setItemStorage } from "~/common/func/localStorage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useQueryParams, { useQueryNextJS } from "~/common/hooks/useQueryParams";

import { GrSearch } from "react-icons/gr";
import { PropsSearch } from "./interfaces";
import clsx from "clsx";
import { removeVietnameseTones } from "~/common/func/isVietNam";
import styles from "./Search.module.scss";
import { useRouter } from "next/router";

function Search({
  placeholder = "Enter search keywords",
  keyName = "keyword",
  transparent,
  p_10,
  height = 40,
  color = "#000",
  onClose,
  recentSearches,
}: PropsSearch) {
  const ref = useRef<any>(null);

  const router = useRouter();
  const { [keyName]: keyQuery } = router.query;

  const { isReady } = useQueryParams();
  const { setQuery } = useQueryNextJS();

  const [keyword, setKeyword] = useState<string>("");
  const [isFocus, setIsfocus] = useState<boolean>(false);
  const [showRecentSearches, setShowRecentSearches] = useState<boolean>(false);

  const [listRecent, setListRecent] = useState<string[]>([]);

  const addKeywordToListRecent = useCallback(() => {
    setListRecent((prev) => {
      const filteredList = prev.filter((x) => x !== keyword);
      if (filteredList.length >= 30) {
        filteredList.pop();
      }
      return [keyword, ...filteredList];
    });
  }, [keyword]);

  const removeToListRecent = useCallback((keyword: string) => {
    setListRecent((perv) => perv.filter((x) => x != keyword));
  }, []);

  const setType = (key: string, value: any) => {
    if (!!value) {
      addKeywordToListRecent();
      setQuery({
        ...router.query,
        [key]: value,
      });
    } else {
      if (Object.keys(router.query).length > 0) {
        setQuery({
          [key]: null,
        });
      }
    }
  };

  const handleSubmit = () => {
    setShowRecentSearches(false);
    setType(keyName, keyword);
  };

  //Get list in storage
  useEffect(() => {
    const state = getItemStorage(
      process?.env?.NEXT_PUBLIC_KEY_LOCALSTORAGE + "kw"
    );
    setListRecent(state || []);
  }, []);

  //Update storage when listRecent update
  useEffect(() => {
    setItemStorage(
      process?.env?.NEXT_PUBLIC_KEY_LOCALSTORAGE + "kw",
      listRecent
    );
  }, [listRecent]);

  //Auto search when close tab
  // useEffect(() => {
  //   if (recentSearches && !showRecentSearches) {
  //     handleSubmit();
  //   }
  // }, [recentSearches, showRecentSearches]);

  useEffect(() => {
    if (recentSearches) {
      const handleClick = (e: any) => {
        if (ref.current && !ref.current.contains(e.target)) {
          setShowRecentSearches(false);
        }
      };
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [recentSearches]);

  useEffect(() => {
    if (!!keyQuery) {
      setKeyword(keyQuery as string);
    } else {
      if (isReady) {
        setKeyword("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyQuery]);

  useEffect(() => {
    if (!recentSearches) {
      const handler = setTimeout(() => {
        setType(keyName, keyword);
      }, 500);
      return () => clearTimeout(handler);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyName, keyword, recentSearches]);

  return (
    <div
      ref={ref}
      className={clsx({
        [styles.recentSearchesContainer]: showRecentSearches && recentSearches,
      })}
      style={{ position: "relative" }}
    >
      <div
        className={clsx(styles.container, {
          [styles.focus]: isFocus,
          [styles.transparent]: transparent,
          [styles.onClose]: onClose,
          [styles.p_10]: p_10,
          [styles.recentSearches]: showRecentSearches && recentSearches,
        })}
        style={{ height }}
      >
        {!transparent ? (
          <div className={styles.icon} onClick={handleSubmit}>
            <GrSearch color="#3f4752" size={20} />
          </div>
        ) : null}
        <input
          onClick={() => setShowRecentSearches(!showRecentSearches)}
          style={{ color }}
          type="search"
          value={keyword}
          placeholder={placeholder}
          onFocus={() => setIsfocus(true)}
          onBlur={() => setIsfocus(false)}
          onChange={(e: any) => setKeyword(e.target.value)}
        />
        {onClose ? (
          <div
            className={styles.close}
            onClick={() => {
              onClose && onClose();
            }}
          >
            <RiCloseLine />
          </div>
        ) : null}
      </div>
      {showRecentSearches && recentSearches ? (
        <div className={styles.recentSearch}>
          <p>Tìm kiếm gần đây:</p>
          <div className={styles.list}>
            {listRecent?.map((v, i) => {
              //Danh sách hiển thị tương ứng viết từ khoá người dùng đang nhập
              //Thêm bỏ dấu với tiếng việt
              if (
                removeVietnameseTones(v).includes(
                  removeVietnameseTones(keyword)
                )
              ) {
                return (
                  <div
                    className={styles.item}
                    key={i}
                    onClick={() => {
                      setKeyword(v);
                    }}
                  >
                    <i>
                      <RiTimeLine />
                    </i>
                    <p>{v}</p>
                    <i
                      onClick={(e) => {
                        e.stopPropagation();
                        removeToListRecent(v);
                      }}
                    >
                      <RiCloseFill />
                    </i>
                  </div>
                );
              }
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Search;
