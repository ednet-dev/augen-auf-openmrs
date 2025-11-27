import React from "react";
import { HelpFilled } from "@carbon/react/icons";
import type { CarbonIconType } from "@carbon/react/icons";
import styles from "./empty-state.component.scss";

type Props = {
    icon?: CarbonIconType;
    title: string;
    description: string;
};

export const EmptyState = ({ icon: Icon = HelpFilled, title, description }: Props) => {
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
                <Icon size={48} />
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
};
