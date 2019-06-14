using FinalFantasyXIVSquadBuilder.Lib.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace FinalFantasyXIVSquadBuilder.Lib.Models
{
    public class ErrorResult : ICalcResult
    {
        public string ErrorMessage { get; private set; }

        public ErrorResult(string message)
        {
            ErrorMessage = message;
        }
    }
}
