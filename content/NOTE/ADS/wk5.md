# Backtracking(回溯算法)

!!!section "回溯算法"
    回溯算法是一种算法技术，通过逐步尝试部分解决方案来解决问题，如果某个部分解决方案不满足问题的约束条件，就会放弃它。它会探索所有可能的解决方案，并排除那些不符合条件的选项。

## 八皇后问题

!!!definition "八皇后问题"
    八皇后问题是一个经典的组合优化问题，目标是在一个 8×8 的国际象棋棋盘上放置 8 个皇后，使得它们彼此之间无法攻击。换句话说，任何两个皇后不能在同一行、同一列或同一对角线上。

k皇后问题是八皇后问题的一般化，即在一个 n×n 的棋盘上放置 k 个皇后，使得它们彼此之间无法攻击。

???advice "个人cpp代码"
    ```cpp
    #include<iostream>
    #include<vector>
    class Game
    {
        public:
        int Number;
        std::vector<std::vector<int>> solutions;
        std::vector<int> Queen_setRow;
        void init(int N);
        void find_solution(int row);
        bool is_safe(int row, int col);
    };


    void Game::init(int N)
    {
        Number = N;
        for(int i=0; i<N; i++)
        {
            Queen_setRow.push_back(-1);
        }
    }
    bool Game::is_safe(int row, int col)
    {
        for(int i=0; i<row; i++)
        {
            if(Queen_setRow[i] == col || abs(Queen_setRow[i] - col) == abs(i - row))
            {
                return false;
            }
        }
        return true;
    }


    void Game::find_solution(int row)
    {
        if(row == Number)
        {
            solutions.push_back(Queen_setRow);
        }

        else {
            for(int col=0; col<Number; col++)
            {
                if(is_safe(row, col))
                {
                    Queen_setRow[row] = col;
                    find_solution(row+1);
                    Queen_setRow[row] = -1;
                }
            }
        }
    }

    int main()
    {
        int N;
        scanf("%d", &N);
        Game chess;
        chess.init(N);
        chess.find_solution(0);
        
        if(chess.solutions.size() < 3)
        {
            for(int i=0;i<chess.solutions.size();i++)
            {
                for(int j=0; j<chess.solutions[i].size(); j++)
                {
                printf("%d ", chess.solutions[i][j]+1);
                }
                printf("\n");
            }
            for(int k=0;k<3-chess.solutions.size();k++)
            {
                printf("\n");
            }
        }
        else{
            for(int i=0; i<3; i++)
        {
            for(int j=0; j<chess.solutions[i].size(); j++)
            {
            printf("%d ", chess.solutions[i][j]+1);
            }
            printf("\n");
        }
        }
        printf("%ld", chess.solutions.size());
    }
    ```