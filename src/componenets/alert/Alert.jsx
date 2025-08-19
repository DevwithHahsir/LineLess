import React, { useEffect } from "react";
import styled from "styled-components";

const Alert = ({
  type = "success",
  message = "",
  duration = 2000,
  onClose,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  // Choose icon based on type
  const getIcon = () => {
    if (type === "success") {
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    }
    if (type === "error") {
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <StyledWrapper>
      <ul className="notification-container">
        <li className={`notification-item ${type}`}>
          <div className="notification-content">
            <div className="notification-icon">{getIcon()}</div>
            <div className="notification-text">{message}</div>
          </div>
          <div className="notification-progress-bar" />
        </li>
      </ul>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Notification container */

  .notification-container {
    /* Position top left */

    /* position: fixed;
        top: 2%;
        left: 2%;
              position: fixed;
              bottom: 2%;
              right: 2%;
              z-index: 1000;
              max-width: 350px;
        max-width: 80%; */

    --content-color: black;
    --background-color: #f3f3f3;
    --font-size-content: 0.75em;
    --icon-size: 1em;

    max-width: 80%;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    list-style-type: none;
    font-family: sans-serif;
    color: var(--content-color);
  }

  /* Notification Item */

  .notification-item {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    gap: 1em;
    overflow: hidden;
    padding: 10px 15px;
    border-radius: 6px;
    box-shadow: rgba(111, 111, 111, 0.2) 0px 8px 24px;
    background-color: var(--background-color);
    transition: all 250ms ease;

    /* Background Pattern */

    --grid-color: rgba(225, 225, 225, 0.7);
    background-image: linear-gradient(
        0deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      );
    background-size: 55px 55px;
  }

  .notification-item svg {
    transition: 250ms ease;
  }

  .notification-item:hover {
    transform: scale(1.01);
  }

  .notification-item:active {
    transform: scale(1.05);
  }

  .notification-item .notification-close:hover {
    background-color: rgba(204, 204, 204, 0.45);
  }

  .notification-item .notification-close:hover svg {
    color: rgb(0, 0, 0);
  }

  .notification-item .notification-close:active svg {
    transform: scale(1.1);
  }

  /* Notification Icons */

  .notification-item .notification-close {
    padding: 2px;
    border-radius: 5px;
    transition: all 250ms;
  }

  .notification-container {
    position: fixed;
    right: 2%;
    bottom: 2%;
    z-index: 1000;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    list-style-type: none;
    font-family: sans-serif;
    color: var(--content-color);
    align-items: flex-end;
  }
  .success {
    color: #047857;
    background-color: #7dffbc;
    --grid-color: rgba(16, 185, 129, 0.25);
    background-image: linear-gradient(
        0deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      );
  }

  .success svg {
    color: #047857;
  }

  .success .notification-progress-bar {
    background-color: #047857;
  }

  .success:hover {
    background-color: #5bffaa;
  }

  /* Info */

  .info {
    color: #1e3a8a;
    background-color: #7eb8ff;
    --grid-color: rgba(59, 131, 246, 0.25);
    background-image: linear-gradient(
        0deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      );
  }

  .info svg {
    color: #1e3a8a;
  }

  .info .notification-progress-bar {
    background-color: #1e3a8a;
  }

  .info:hover {
    background-color: #5ba5ff;
  }

  /* Warning */

  .warning {
    color: #78350f;
    background-color: #ffe57e;
    --grid-color: rgba(245, 159, 11, 0.25);
    background-image: linear-gradient(
        0deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      );
  }

  .warning svg {
    color: #78350f;
  }

  .warning .notification-progress-bar {
    background-color: #78350f;
  }

  .warning:hover {
    background-color: #ffde59;
  }

  /* Error */

  .error {
    color: #7f1d1d;
    background-color: #ff7e7e;
    --grid-color: rgba(239, 68, 68, 0.25);
    background-image: linear-gradient(
        0deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      );
  }

  .error svg {
    color: #7f1d1d;
  }

  .error .notification-progress-bar {
    background-color: #7f1d1d;
  }

  .error:hover {
    background-color: #ff5f5f;
  }

  /* Notification content */

  .notification-content {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5em;
  }

  .notification-text {
    font-size: var(--font-size-content);
    user-select: none;
  }

  .notification-close {
    cursor: pointer;
  }

  /* Notification progress bar */

  .notification-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 1px;
    background: var(--content-color);
    width: 100%;
    transform: translateX(100%);

    /* Remove the infinite property for your website */

    animation: progressBar 5s linear forwards infinite;
  }

  /* progressBar Animation */

  @keyframes progressBar {
    0% {
      transform: translateX(0);
    }

    100% {
      transform: translateX(-100%);
    }
  }
`;

export default Alert;
