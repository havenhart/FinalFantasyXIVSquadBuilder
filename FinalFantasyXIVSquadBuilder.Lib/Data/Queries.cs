using FinalFantasyXIVSquadBuilder.Lib.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using System.Data.SQLite;
using System.Linq;

namespace FinalFantasyXIVSquadBuilder.Lib.Data
{
    public static class Queries
    {
        public static async Task<List<SquadMember>> GetBaseSquadValues()
        {
            using (var con = new SQLiteConnection($@"Data Source=./ffxivsb.db"))
            {
                await con.OpenAsync();
                return (await con.QueryAsync<SquadMember>("SELECT * FROM squad ORDER BY ID")).ToList();
            }
        }

        public static async Task<List<SquadMember>> GetAttributeValues()
        {
            using (var con = new SQLiteConnection($@"Data Source=./ffxivsb.db"))
            {
                await con.OpenAsync();
                return (await con.QueryAsync<SquadMember>("SELECT AttributeType AS [Name], Physical, Mental, Tactical FROM AttributeValues")).ToList();
            }
        }
    }
}
