"""整理实验用时记录。把 learning-log.csv 放在本脚本旁，再运行本脚本。"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # 把图存成文件，不依赖弹出窗口。
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


def main():
    output_dir = Path(__file__).resolve().parent
    csv_path = output_dir / "learning-log.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"请把 learning-log.csv 放在脚本旁：{csv_path}")

    records = pd.read_csv(csv_path)
    required = {"date", "subject", "minutes"}
    missing_columns = required.difference(records.columns)
    if missing_columns:
        raise ValueError(f"CSV 缺少列：{', '.join(sorted(missing_columns))}")
    if records.empty:
        raise ValueError("CSV 没有实验用时记录，请至少填写一行。")
    if records[list(required)].isna().any().any():
        raise ValueError("日期、任务或时长有缺失；先确认原因，不要自动补成 0。")

    records["date"] = pd.to_datetime(records["date"], format="%Y-%m-%d")
    records["subject"] = records["subject"].astype(str).str.strip()
    records["minutes"] = pd.to_numeric(records["minutes"], errors="raise")
    if (records["subject"] == "").any():
        raise ValueError("任务不能为空。")
    if not np.isfinite(records["minutes"].to_numpy()).all():
        raise ValueError("时长必须是有限数值。")
    if (records["minutes"] < 0).any():
        raise ValueError("时长不能为负数，请检查原始记录。")

    totals = records.groupby("subject")["minutes"].sum().sort_values(ascending=False)
    daily = records.groupby("date")["minutes"].sum().sort_index()
    print("各任务总时长（分钟）：")
    print(totals.to_string())
    print("\n按日期汇总（分钟）：")
    print(daily.to_string())
    print(f"\n总计：{records['minutes'].sum():.1f} 分钟")
    print(f"有记录的 {len(daily)} 天，平均每天 {daily.mean():.1f} 分钟")

    fig, ax = plt.subplots(figsize=(6.4, 4.2))
    totals.plot.bar(ax=ax, color="#527a9b", rot=0)
    ax.set(title="Lab time by task", xlabel="Task", ylabel="Minutes")
    ax.set_ylim(bottom=0)
    ax.bar_label(ax.containers[0], fmt="%.0f", padding=3)
    ax.margins(y=0.15)
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    image_path = output_dir / "learning-log-summary.png"
    fig.savefig(image_path, dpi=160)
    plt.close(fig)
    print(f"图已保存：{image_path}")


if __name__ == "__main__":
    main()
