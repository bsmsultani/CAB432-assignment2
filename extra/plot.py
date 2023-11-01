import pandas as pd
import plotly.express as px
import argparse
import os

def load_data(filepath):
    df = pd.read_json(filepath)
    return df

def preprocess_data(df):
    df = df['objects'].apply(lambda x: [i['name'] for i in x]).explode()
    df = pd.DataFrame({"second": df.index, "object": df.values})
    return df

def plot_top_objects(df, interval, n, output_path):
    pivot_df = df.groupby(['second', 'object']).size().unstack(fill_value=0).reset_index()
    pivot_df['time_interval'] = (pivot_df['second'] // interval) * interval
    agg_df = pivot_df.groupby('time_interval').sum().drop(columns=['second'])
    top_objects = agg_df.sum().sort_values(ascending=False).head(n).index.tolist()
    agg_df = agg_df[top_objects]

    fig = px.bar(agg_df, x=agg_df.index, y=top_objects, title="Top Object Appearances Over Time Intervals", labels={"value": "Number of Appearances", "time_interval": "Time Interval"}, height=400)
    fig.update_layout(barmode='stack', xaxis_title=f"Time (in intervals of {interval} seconds)", yaxis_title='Number of Objects')
    
    fig.write_html(output_path)

def compare_object_over_time(df, selected_objects, output_path):
    pivot_df = df.groupby(['second', 'object']).size().unstack(fill_value=0).reset_index()
    filtered_df = pivot_df[["second"] + selected_objects]
    melted_df = filtered_df.melt(id_vars=["second"], value_vars=selected_objects, var_name="Object", value_name="Frequency")
    fig = px.line(melted_df, x="second", y="Frequency", color="Object", title="Comparison of Object Appearances Over Time")
    fig.update_layout(xaxis_title='Second', yaxis_title='Number of Appearances')
    
    fig.write_html(output_path)

def plot_object_frequencies(df, start, end, output_path):
    df_freq = df['object'].value_counts().reset_index()
    df_freq.columns = ['object', 'count']

    def get_objects_in_range(df, start, end):
        sorted_df = df.sort_values(by='count', ascending=False)
        return sorted_df.iloc[start-1:end]

    objects_in_range = get_objects_in_range(df_freq, start, end)
    fig = px.bar(objects_in_range, x='count', y='object', orientation='h', color='object', title='Frequency Distribution of Object Appearances', labels={'count': 'Number of Appearances', 'object': 'Object Type'})
    fig.update_layout(xaxis_title='Number of Appearances', yaxis_title='Object Type')
    
    fig.write_html(output_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate graphs from JSON file')

    parser.add_argument("--filepath", required=True, help="Path to the JSON file.")
    parser.add_argument("--function", required=True, choices=["plot_top_objects", "compare_object_over_time", "plot_object_frequencies"], help="Function to run.")
    parser.add_argument("--interval", type=int, default=20, help="Interval for the plot_top_objects function.")
    parser.add_argument("--n", type=int, default=20, help="Number of top objects for the plot_top_objects function.")
    parser.add_argument("--selected_objects", nargs='+', default=[], help="List of objects for the compare_object_over_time function.")
    parser.add_argument("--start", type=int, default=1, help="Start range for the plot_object_frequencies function.")
    parser.add_argument("--end", type=int, default=10, help="End range for the plot_object_frequencies function.")
    parser.add_argument("--output_file", required=True, help="Full output path (including directory and file name) for the generated graphs.")
    
    args = parser.parse_args()
    
    df = load_data(args.filepath)
    df = preprocess_data(df)
    
    if args.function == "plot_top_objects":
        plot_top_objects(df, args.interval, args.n, args.output_file)
        
    elif args.function == "compare_object_over_time":
        compare_object_over_time(df, args.selected_objects, args.output_file)
    
    elif args.function == "plot_object_frequencies":
        plot_object_frequencies(df, args.start, args.end, args.output_file)
