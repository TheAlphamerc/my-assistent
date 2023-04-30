import React from "react";
import cx from "classnames";
interface ListViewProps {
  items: Array<any> | undefined | null;
  renderItem: (item: any, index: number) => React.ReactNode;
  placeholder?: React.ReactNode;
  noItemsElement?: React.ReactNode;
  footerElement?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

/**
 * @name ListView Component to display a list of items
 * @description A list view component that renders a list of items.
 * @param {Array<any>} items - The list of items to be rendered
 * @param {React.ReactNode} renderItem - The function that renders each item
 * @param {React.ReactNode} placeholder - The placeholder to be displayed when the list is empty
 * @param {string} noItemsElement - The message to be displayed when the list is empty
 * @param {React.ReactNode} footerElement - The element to be displayed at the bottom of the list
 * @param {string} className - The class name to be applied to the list view
 * @param {boolean} loading - The flag to indicate if the list is loading
 * @returns {React.ReactNode} - The list view component
 */

export const ListView: React.FC<ListViewProps> = ({
  items,
  renderItem,
  noItemsElement,
  footerElement,
  placeholder,
  className,
  loading = false,
}) => {
  if (loading) {
    return placeholder ? <>{placeholder}</> : null;
  }

  if (!items || items === null || !Array.isArray(items) || items.length === 0) {
    return <>{noItemsElement && noItemsElement}</>;
  }

  return (
    <div style={{ listStyle: "none" }} className={cx("ListView ", className)}>
      {items?.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
      {footerElement && footerElement}
    </div>
  );
};

// @ts-ignore
export const TableBody: React.FC<ListViewProps> = ({
  items,
  renderItem,
  noItemsElement,
  footerElement,
  placeholder,
  className,
  loading = false,
}) => {
  if (loading) {
    return placeholder && <>{placeholder}</>;
  }

  if (!items || items === null || items.length === 0) {
    return <>{noItemsElement && noItemsElement}</>;
  }

  if (items === null || !Array.isArray(items) || items.length === 0) {
    return <>{noItemsElement && noItemsElement}</>;
  }

  return items.map((item, index) => renderItem(item, index));
};
