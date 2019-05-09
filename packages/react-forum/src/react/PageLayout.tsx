import React from 'react';
import "./PageLayout.css"
import { config } from "../config"
import { ReactComponent as Close } from "./icons/misc/Close_12x_16x.svg";

/*
  This passes content as ReactElement instances

  It could pass content as FunctionComponent instances instead, see
  https://stackoverflow.com/a/55963664/49942
*/

export interface KeyedItem {
  element: React.ReactElement;
  key: string;
}

type MainContent = ReadonlyArray<KeyedItem> | React.ReactElement | string;

interface RightContent {
  element: React.ReactElement,
  width: string,
  showButtonLabel: string,
  visible: boolean
}

export interface Contents {
  main: MainContent,
  width?: "Full" | "Grid"
  right?: RightContent
};

export const loadingContents = { main: "Loading..." };

interface Column {
  title: string;
  contents: Contents;
}

function setTitle(title: string): void {
  document.title = `${title} - ${config.appname}`;
}

function renderMainColumn(main: MainContent) {
  return (Array.isArray(main))
    ?
    main.map((x) =>
      <div className="element" key={x.key}>
        {x.element}
      </div>
    )
    :
    <div className="element">
      {main}
    </div>;
}

function renderRightColumn(right?: RightContent) {
  if (!right) {
    return { rightColumn: null, rightButton: null };
  }

  const refDiv = React.createRef<HTMLDivElement>();
  const refButton = React.createRef<HTMLButtonElement>();

  function hideOrShow(show: boolean) {
    const boundDiv = refDiv.current;
    const boundButton = refButton.current;
    if (!boundDiv || !boundButton) {
      return;
    }
    if (show) {
      boundDiv.classList.remove("hidden");
      boundButton.classList.add("hidden");
    } else {
      boundDiv.classList.add("hidden");
      boundButton.classList.remove("hidden");
    }
  }
  function handleShowDiv(event: React.MouseEvent<HTMLButtonElement>): void {
    hideOrShow(true);
    event.preventDefault();
  }
  function handleHideDiv(event: React.MouseEvent<HTMLButtonElement>): void {
    hideOrShow(false);
    event.preventDefault();
  }

  function className(name: string, visible: boolean) {
    return (visible) ? name : (name + " hidden");
  }

  const rightButton = (
    <button className={className("column-right-button", !right.visible)} type="button" onClick={handleShowDiv} ref={refButton}>
      {right.showButtonLabel}
    </button>
  );

  const closeButton = (
    <button className="column-close-button" type="button" onClick={handleHideDiv} title="Close">
      <Close viewBox="0 0 16 16" width="16" height="16" />
    </button>
  );

  const rightColumn = (
    <div className={className("column-right", right.visible)} style={{ width: right.width }} ref={refDiv} >
      {closeButton}
      {right.element}
    </div>
  );

  return { rightColumn, rightButton };
}

function renderColumns(contents: Contents, title: string) {
  const mainColumn = renderMainColumn(contents.main);
  const { rightColumn, rightButton } = renderRightColumn(contents.right);

  const className = !contents.width
    ? "column-text"
    : (contents.width === "Grid")
      ? "column-text grid"
      : "column-wide";

  switch (className) {
    case "column-text":
    case "column-text grid":
      return (
        <React.Fragment>
          <div className={className}>
            {rightButton}
            <div className="header">
              <h1>{title}</h1>
            </div>
            <div className="content">
              {mainColumn}
            </div>
          </div>
          {rightColumn}
        </React.Fragment>
      );
    case "column-wide":
      return (
        <React.Fragment>
          <div className="column-wide">
            {rightButton}
            {mainColumn}
          </div>
          {rightColumn}
        </React.Fragment>
      );
  }
}

export const renderContents = (column: Column): React.ReactElement => {
  setTitle(column.title);
  const contents = renderColumns(column.contents, column.title);
  return (
    <div className="all-columns">
      {contents}
    </div>
  );
}