import React, { useState, useEffect, useRef } from "react";
import "./index.css";

import Header from "./components/Header/Header.jsx";
import Button from "./components/Button/Button.jsx";

function App() {
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const containerImageRef = useRef(null);

  const [fetchedData, setFetchedData] = useState(null);
  const [error, setError] = useState(null);
  const [containerInfoVisible, setContainerInfoVisible] = useState(false);

  useEffect(() => {
    function setImageHeight() {
      const headerHeight = headerRef.current.offsetHeight;
      const footerHeight = footerRef.current.offsetHeight;

      if (containerImageRef.current) {
        containerImageRef.current.style.height = `calc(100% - ${headerHeight}px - ${footerHeight}px)`;
      }
    }

    window.addEventListener("resize", setImageHeight);

    // Set image height initially:
    setImageHeight();
    // Get a random image initially:
    fetchData(baseUrl + "&count=1");

    // Clean up function
    return () => {
      window.removeEventListener("resize", setImageHeight);
    };
  }, []);

  const baseUrl =
    "https://api.nasa.gov/planetary/apod?api_key=v3uFn7uhfV3YcTTafG142dqcDpC1FClGV4xWMmeM";

  // fetch data, customize output by modifying url parameter
  async function fetchData(url) {
    // remove the popup info container if it isn't already toggled off:
    setContainerInfoVisible(false);

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log("1", response.status);

      setFetchedData(null);
      setError(null);

      console.log("2", data);

      if (response.status != 200) {
        setError(data.msg); // the error message provided in the object)
      } else {
        // data comes as an object or as an array (each index containing an object)
        let dataChecked;
        if (Array.isArray(data)) {
          dataChecked = data[0];
        } else {
          dataChecked = data;
        }

        setFetchedData(dataChecked);

        // append image, skip videos.
        if (dataChecked.media_type === "image") {
          setFetchedData(dataChecked);
        } else if (dataChecked.media_type === "video") {
          // display error message for 5 sec, then get a new random image:
          let i = 5;
          let interval = setInterval(() => {
            let errorMessageVideo = `No image available on the chosen day. Getting a random one in ${i}`;

            setError(errorMessageVideo);

            i--;
          }, 1000);

          setTimeout(() => {
            // get a random image
            fetchData(baseUrl + "&count=1");
            clearInterval(interval);
          }, 6000);
        }
      }
    } catch (error) {
      console.error(error);
      console.log(error);
    }
  }

  return (
    <>
      <Header
        ref={headerRef}
        onClickRandomButton={() => fetchData(baseUrl + "&count=1")}
        onChangeDateInput={(event) =>
          fetchData(baseUrl + "&date=" + event.target.value)
        }
      />

      <div ref={containerImageRef} className="container-image">
        {fetchedData && <img src={fetchedData.url} alt={fetchedData.title} />}
        {error && <p className="error-message">{error}</p>}
      </div>

      <footer ref={footerRef}>
        <a
          href="https://github.com/JoarHansson/space-images"
          className="github-link"
          target="”_blank”"
        >
          Github
        </a>
        <button
          className="button-info"
          onClick={() => setContainerInfoVisible(!containerInfoVisible)}
        >
          Image Info
        </button>
      </footer>

      {containerInfoVisible && (
        <div className="container-info">
          <button
            className="button-close-info"
            onClick={() => setContainerInfoVisible(false)}
          >
            X
          </button>
          <p className="image-title">Title: {fetchedData.title}</p>
          <p className="image-date">Date: {fetchedData.date}</p>
          <p className="image-copyright">
            Copyright: {fetchedData.copyright ?? "Not specified"}
          </p>
          <p className="image-explanation">
            Explanation: {fetchedData.explanation}
          </p>
        </div>
      )}
    </>
  );
}

export default App;