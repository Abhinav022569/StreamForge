export const TEMPLATES = [
    // --- 1. Basic Cleaning ---
    {
        id: 'cleaning',
        name: '🧼 Clean & Deduplicate',
        description: 'Essential data hygiene pipeline. It loads a CSV, fills missing values, removes duplicate rows, and saves the result.',
        nodes: [
            { id: 't1_src', type: 'source_csv', position: { x: 50, y: 150 }, data: { label: 'Raw Data (CSV)', filename: '' } },
            { id: 't1_fill', type: 'trans_fillna', position: { x: 350, y: 150 }, data: { label: 'Fill Missing', column: 'target_col', value: '0' } },
            { id: 't1_dedupe', type: 'trans_dedupe', position: { x: 650, y: 150 }, data: { label: 'Remove Duplicates' } },
            { id: 't1_dest', type: 'dest_csv', position: { x: 950, y: 150 }, data: { label: 'Cleaned Output', outputName: 'clean_data.csv' } }
        ],
        edges: [
            { id: 'e1_1', source: 't1_src', target: 't1_fill', type: 'deletableEdge' },
            { id: 'e1_2', source: 't1_fill', target: 't1_dedupe', type: 'deletableEdge' },
            { id: 'e1_3', source: 't1_dedupe', target: 't1_dest', type: 'deletableEdge' }
        ]
    },

    // --- 2. Aggregation Report ---
    {
        id: 'aggregation',
        name: '📊 Aggregation Report',
        description: 'Groups data by a category column (e.g., Department) and calculates the sum of a metric, then sorts the results.',
        nodes: [
            { id: 't2_src', type: 'source_excel', position: { x: 50, y: 150 }, data: { label: 'Sales Data (Excel)', filename: '', fileType: 'EXCEL' } },
            { id: 't2_group', type: 'trans_group', position: { x: 350, y: 150 }, data: { label: 'Sum Sales by Region', groupCol: 'Region', targetCol: 'Sales', operation: 'sum' } },
            { id: 't2_sort', type: 'trans_sort', position: { x: 650, y: 150 }, data: { label: 'Sort Descending', column: 'Sales', order: 'false' } },
            { id: 't2_dest', type: 'dest_json', position: { x: 950, y: 150 }, data: { label: 'Report JSON', outputName: 'sales_report.json' } }
        ],
        edges: [
            { id: 'e2_1', source: 't2_src', target: 't2_group', type: 'deletableEdge' },
            { id: 'e2_2', source: 't2_group', target: 't2_sort', type: 'deletableEdge' },
            { id: 'e2_3', source: 't2_sort', target: 't2_dest', type: 'deletableEdge' }
        ]
    },

    // --- 3. Visualization ---
    {
        id: 'visualization',
        name: '📈 Data Visualization',
        description: 'Filters data to a specific subset and generates a bar chart for visual analysis alongside a data dump.',
        nodes: [
            { id: 't3_src', type: 'source_csv', position: { x: 50, y: 200 }, data: { label: 'Dataset', filename: '' } },
            { id: 't3_filter', type: 'filterNode', position: { x: 350, y: 200 }, data: { label: 'Filter Active', column: 'status', condition: '==', value: 'active' } },
            { id: 't3_chart', type: 'vis_chart', position: { x: 700, y: 100 }, data: { label: 'Bar Analysis', chartType: 'bar', x_col: 'category', y_col: 'value', outputName: 'analysis_chart.png' } },
            { id: 't3_dest', type: 'dest_csv', position: { x: 700, y: 300 }, data: { label: 'Filtered Data', outputName: 'filtered_subset.csv' } }
        ],
        edges: [
            { id: 'e3_1', source: 't3_src', target: 't3_filter', type: 'deletableEdge' },
            { id: 'e3_2', source: 't3_filter', target: 't3_chart', type: 'deletableEdge' },
            { id: 'e3_3', source: 't3_filter', target: 't3_dest', type: 'deletableEdge' }
        ]
    },

    // --- 4. NEW: Multi-Source Join ---
    {
        id: 'join_enrich',
        name: '🔗 Multi-Source Enrich',
        description: 'Merges two separate datasets (e.g., Transactions and Customers) based on a common ID, calculates a total value, and exports to a Database.',
        nodes: [
            { id: 't4_src1', type: 'source_csv', position: { x: 50, y: 100 }, data: { label: 'Transactions (CSV)', filename: '' } },
            { id: 't4_src2', type: 'source_json', position: { x: 50, y: 300 }, data: { label: 'Customers (JSON)', filename: '', fileType: 'JSON' } },
            { id: 't4_join', type: 'trans_join', position: { x: 400, y: 200 }, data: { label: 'Join on ID', key: 'user_id', how: 'inner' } },
            { id: 't4_calc', type: 'trans_calc', position: { x: 700, y: 200 }, data: { label: 'Calc Total (Price * Qty)', colA: 'price', op: '*', colB: 'quantity', newCol: 'total' } },
            { id: 't4_dest', type: 'dest_db', position: { x: 1000, y: 200 }, data: { label: 'Export to SQL', outputName: 'enriched_sales.db' } }
        ],
        edges: [
            { id: 'e4_1', source: 't4_src1', target: 't4_join', type: 'deletableEdge' },
            { id: 'e4_2', source: 't4_src2', target: 't4_join', type: 'deletableEdge' },
            { id: 'e4_3', source: 't4_join', target: 't4_calc', type: 'deletableEdge' },
            { id: 'e4_4', source: 't4_calc', target: 't4_dest', type: 'deletableEdge' }
        ]
    },

    // --- 5. NEW: Split Stream Processing ---
    {
        id: 'split_stream',
        name: '🔀 Filter & Split Stream',
        description: 'Loads a master dataset and splits it into two separate files based on a condition (e.g., High Priority vs. Standard).',
        nodes: [
            { id: 't5_src', type: 'source_excel', position: { x: 50, y: 250 }, data: { label: 'Master List (Excel)', filename: '', fileType: 'EXCEL' } },
            
            // Top Branch (High Priority)
            { id: 't5_filter_a', type: 'filterNode', position: { x: 400, y: 100 }, data: { label: 'Priority == High', column: 'priority', condition: '==', value: 'High' } },
            { id: 't5_dest_a', type: 'dest_csv', position: { x: 750, y: 100 }, data: { label: 'High Priority List', outputName: 'high_priority.csv' } },
            
            // Bottom Branch (Standard Priority) - Note: In a real app logic would be implicit, here we simulate with opposite filter
            { id: 't5_filter_b', type: 'filterNode', position: { x: 400, y: 400 }, data: { label: 'Priority != High', column: 'priority', condition: '!=', value: 'High' } },
            { id: 't5_dest_b', type: 'dest_csv', position: { x: 750, y: 400 }, data: { label: 'Standard List', outputName: 'standard_list.csv' } }
        ],
        edges: [
            { id: 'e5_1', source: 't5_src', target: 't5_filter_a', type: 'deletableEdge' },
            { id: 'e5_2', source: 't5_filter_a', target: 't5_dest_a', type: 'deletableEdge' },
            { id: 'e5_3', source: 't5_src', target: 't5_filter_b', type: 'deletableEdge' },
            { id: 'e5_4', source: 't5_filter_b', target: 't5_dest_b', type: 'deletableEdge' }
        ]
    },

    // --- 6. NEW: Advanced Data Prep ---
    {
        id: 'adv_prep',
        name: '✨ Advanced Data Prep',
        description: 'A comprehensive cleaning chain: rename columns, cast types, format strings, and handle missing data before exporting.',
        nodes: [
            { id: 't6_src', type: 'source_csv', position: { x: 0, y: 100 }, data: { label: 'Raw Imports', filename: '' } },
            { id: 't6_rename', type: 'trans_rename', position: { x: 250, y: 100 }, data: { label: 'Rename Col', oldName: 'fname', newName: 'First Name' } },
            { id: 't6_cast', type: 'trans_cast', position: { x: 500, y: 100 }, data: { label: 'Cast ID to Int', column: 'id', targetType: 'int' } },
            { id: 't6_string', type: 'trans_string', position: { x: 750, y: 100 }, data: { label: 'Title Case Name', column: 'First Name', operation: 'title' } },
            { id: 't6_fillna', type: 'trans_fillna', position: { x: 1000, y: 100 }, data: { label: 'Fill Nulls', column: 'score', value: '0' } },
            { id: 't6_dest', type: 'dest_excel', position: { x: 1250, y: 100 }, data: { label: 'Formatted Excel', outputName: 'clean_report.xlsx' } }
        ],
        edges: [
            { id: 'e6_1', source: 't6_src', target: 't6_rename', type: 'deletableEdge' },
            { id: 'e6_2', source: 't6_rename', target: 't6_cast', type: 'deletableEdge' },
            { id: 'e6_3', source: 't6_cast', target: 't6_string', type: 'deletableEdge' },
            { id: 'e6_4', source: 't6_string', target: 't6_fillna', type: 'deletableEdge' },
            { id: 'e6_5', source: 't6_fillna', target: 't6_dest', type: 'deletableEdge' }
        ]
    }
];